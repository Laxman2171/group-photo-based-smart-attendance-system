from flask import Flask, request, jsonify
from deepface import DeepFace
import requests
import numpy as np
import cv2

app = Flask(__name__)

# =============================================================================
# CONFIGURATION - Tune these for your environment
# =============================================================================
MODEL_NAME = "ArcFace"  # More accurate than FaceNet (99.8% vs 99.6% on LFW)
DETECTOR_BACKEND = "mtcnn"  # Faster than retinaface, good accuracy
DISTANCE_THRESHOLD = 0.48  # More lenient to handle lighting/angle variations
# =============================================================================

def url_to_image(url):
    """Download image from URL and return as RGB numpy array"""
    try:
        response = requests.get(url, timeout=120)
        response.raise_for_status()
        image_array = np.frombuffer(response.content, np.uint8)
        bgr_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if bgr_image is None: 
            return None
        # Convert to RGB for deepface
        rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
        return rgb_image
    except Exception as e:
        print(f"Error loading image from {url}: {e}")
        return None

def preprocess_image(image):
    """
    Enhance image for better face recognition in varying lighting conditions.
    - Applies CLAHE (Contrast Limited Adaptive Histogram Equalization)
    - Applies slight denoising
    - Helps with shadows, uneven lighting, and low contrast
    """
    try:
        # Denoise first (helps with low quality photos)
        image = cv2.fastNlMeansDenoisingColored(image, None, 5, 5, 7, 21)
        
        # Convert to LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel (luminance) with stronger settings
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        
        # Merge and convert back to RGB
        lab = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        return enhanced
    except Exception as e:
        print(f"Preprocessing failed, using original: {e}")
        return image

def normalize_embedding(embedding):
    """Normalize embedding to unit vector for consistent comparison"""
    arr = np.asarray(embedding)
    norm = np.linalg.norm(arr)
    if norm == 0:
        return arr
    return (arr / norm).tolist()

def find_cosine_distance(source_representation, test_representation):
    """Calculate cosine distance between two face embeddings"""
    a = np.asarray(source_representation)
    b = np.asarray(test_representation)
    dot_product = np.dot(a, b)
    norm_product = np.linalg.norm(a) * np.linalg.norm(b)
    if norm_product == 0:
        return 1.0  # Maximum distance if invalid
    return 1 - (dot_product / norm_product)

@app.route('/represent', methods=['POST'])
def represent():
    """Generate face embedding for a single student photo (used during registration)"""
    try:
        data = request.get_json()
        img_url = data.get('img_url')
        if not img_url: 
            return jsonify({"error": "img_url is required"}), 400

        image = url_to_image(img_url)
        if image is None: 
            return jsonify({"error": "Could not process image from URL"}), 400

        # Preprocess for better results
        image = preprocess_image(image)

        embedding_obj = DeepFace.represent(
            img_path=image, 
            model_name=MODEL_NAME, 
            enforce_detection=True,
            detector_backend=DETECTOR_BACKEND
        )
        embedding = embedding_obj[0]["embedding"]
        
        # Normalize embedding for consistent comparison
        embedding = normalize_embedding(embedding)
        
        print(f"✓ Successfully generated embedding (dimension: {len(embedding)})")
        return jsonify({"embedding": embedding})
    except Exception as e:
        print(f"✗ Could not create embedding: {str(e)}")
        return jsonify({"error": f"Could not create embedding: {str(e)}"}), 500

@app.route('/recognize', methods=['POST'])
def recognize():
    """
    Recognize faces in a group photo and match them to enrolled students.
    Uses BEST-MATCH-ONLY logic to prevent one face from matching multiple students.
    """
    try:
        data = request.get_json()
        group_photo_url = data.get('group_photo_url')
        student_embeddings_data = data.get('student_embeddings_data')

        if not group_photo_url or not student_embeddings_data:
            return jsonify({"error": "Missing data"}), 400

        # Load and preprocess group photo
        group_image = url_to_image(group_photo_url)
        if group_image is None: 
            return jsonify({"error": "Could not load group photo"}), 400
        
        group_image = preprocess_image(group_image)
        print(f"📷 Processing group photo with {len(student_embeddings_data)} enrolled students")

        # Extract all face embeddings from the group photo
        # Try MTCNN first, fallback to opencv if it fails
        unknown_embeddings = []
        try:
            embedding_objs = DeepFace.represent(
                img_path=group_image,
                model_name=MODEL_NAME,
                enforce_detection=True,
                detector_backend=DETECTOR_BACKEND
            )
            unknown_embeddings = [normalize_embedding(obj["embedding"]) for obj in embedding_objs]
            print(f"👥 Found {len(unknown_embeddings)} faces in group photo using {DETECTOR_BACKEND}")
        except Exception as e:
            print(f"⚠ {DETECTOR_BACKEND} failed: {e}, trying opencv...")
            try:
                embedding_objs = DeepFace.represent(
                    img_path=group_image,
                    model_name=MODEL_NAME,
                    enforce_detection=True,
                    detector_backend="opencv"
                )
                unknown_embeddings = [normalize_embedding(obj["embedding"]) for obj in embedding_objs]
                print(f"👥 Found {len(unknown_embeddings)} faces using opencv fallback")
            except Exception as e2:
                print(f"⚠ opencv also failed: {e2}")
                unknown_embeddings = []

        if not unknown_embeddings:
            return jsonify({
                "present_student_ids": [],
                "message": "No faces detected in the group photo"
            })

        # =====================================================================
        # OPTIMIZED BEST-MATCH ALGORITHM (Vectorized for speed)
        # Computes all distances in batch using numpy matrix operations
        # =====================================================================
        
        present_student_ids = set()
        matched_faces = set()
        match_details = []
        
        # Pre-normalize all student embeddings into a matrix (N_students x embedding_dim)
        student_ids = [s['id'] for s in student_embeddings_data]
        student_matrix = np.array([normalize_embedding(s['embedding']) for s in student_embeddings_data])
        
        # Convert unknown embeddings to matrix (N_faces x embedding_dim)
        unknown_matrix = np.array(unknown_embeddings)
        
        # Compute ALL distances at once using matrix multiplication
        # Cosine distance = 1 - dot_product (since vectors are normalized)
        # Result: (N_faces x N_students) distance matrix
        similarity_matrix = np.dot(unknown_matrix, student_matrix.T)
        distance_matrix = 1 - similarity_matrix
        
        print(f"⚡ Computed {distance_matrix.size} distances in batch ({len(unknown_embeddings)} faces × {len(student_ids)} students)")
        
        # Build matches from distance matrix (only those below threshold)
        all_matches = []
        for face_idx in range(len(unknown_embeddings)):
            for student_idx, distance in enumerate(distance_matrix[face_idx]):
                if distance <= DISTANCE_THRESHOLD:
                    all_matches.append({
                        'face_idx': face_idx,
                        'student_id': student_ids[student_idx],
                        'distance': float(distance)
                    })
        
        # Sort by distance (best matches first)
        all_matches.sort(key=lambda x: x['distance'])
        
        # Assign each face to at most one student (best match only)
        matched_students = set()
        for match in all_matches:
            face_idx = match['face_idx']
            student_id = match['student_id']
            
            # Skip if this face or student is already matched
            if face_idx in matched_faces or student_id in matched_students:
                continue
            
            # Record this match
            matched_faces.add(face_idx)
            matched_students.add(student_id)
            present_student_ids.add(student_id)
            
            match_details.append({
                'face': face_idx + 1,
                'student': student_id,
                'distance': round(match['distance'], 4)
            })

        # Summary logging only
        for m in match_details:
            print(f"  ✓ Face #{m['face']} → Student {m['student'][:8]}... (dist: {m['distance']:.4f})")

        unmatched_faces = len(unknown_embeddings) - len(matched_faces)
        if unmatched_faces > 0:
            print(f"  ⚠ {unmatched_faces} face(s) did not match any enrolled student")

        print(f"✅ Result: {len(present_student_ids)} students marked present")
        
        return jsonify({
            "present_student_ids": list(present_student_ids),
            "faces_detected": len(unknown_embeddings),
            "faces_matched": len(matched_faces),
            "threshold_used": DISTANCE_THRESHOLD,
            "matches": match_details
        })

    except Exception as e:
        print(f"❌ Error in /recognize: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": MODEL_NAME,
        "detector": DETECTOR_BACKEND,
        "threshold": DISTANCE_THRESHOLD
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Smart Attendance AI Service")
    print(f"   Model: {MODEL_NAME}")
    print(f"   Detector: {DETECTOR_BACKEND}")
    print(f"   Threshold: {DISTANCE_THRESHOLD}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5001, debug=True)