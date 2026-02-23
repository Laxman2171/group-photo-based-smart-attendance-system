from flask import Flask, request, jsonify
from deepface import DeepFace
import requests
import numpy as np
import cv2

app = Flask(__name__)

MODEL_NAME = "Facenet"

def url_to_image(url):
    try:
        response = requests.get(url, timeout=120)
        response.raise_for_status()
        image_array = np.frombuffer(response.content, np.uint8)
        bgr_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if bgr_image is None: return None
        # Always convert to RGB for deepface
        rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
        return rgb_image
    except Exception as e:
        print(f"Error loading image from {url}: {e}")
        return None

def find_cosine_distance(source_representation, test_representation):
    a = np.asarray(source_representation)
    b = np.asarray(test_representation)
    return 1 - (np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

@app.route('/represent', methods=['POST'])
def represent():
    try:
        data = request.get_json()
        img_url = data.get('img_url')
        if not img_url: return jsonify({"error": "img_url is required"}), 400

        image = url_to_image(img_url)
        if image is None: return jsonify({"error": "Could not process image from URL"}), 400

        embedding_obj = DeepFace.represent(img_path=image, model_name=MODEL_NAME, enforce_detection=True)
        embedding = embedding_obj[0]["embedding"]
        return jsonify({"embedding": embedding})
    except Exception as e:
        return jsonify({"error": f"Could not create embedding: {str(e)}"}), 500

@app.route('/recognize', methods=['POST'])
def recognize():
    try:
        data = request.get_json()
        group_photo_url = data.get('group_photo_url')
        student_embeddings_data = data.get('student_embeddings_data')

        if not group_photo_url or not student_embeddings_data:
            return jsonify({"error": "Missing data"}), 400

        group_image = url_to_image(group_photo_url)
        if group_image is None: return jsonify({"error": "Could not load group photo"}), 400

        # --- THE NEW, SIMPLIFIED LOGIC ---
        # Let DeepFace do all the work in one command.
        # It will find all faces and return a list of their fingerprints.
        try:
            embedding_objs = DeepFace.represent(
                img_path = group_image,
                model_name = MODEL_NAME,
                enforce_detection = True, # This is key: it tells deepface to find all faces
                detector_backend = 'retinaface'
            )
            unknown_fingerprints = [obj["embedding"] for obj in embedding_objs]
            print(f"Successfully created {len(unknown_fingerprints)} fingerprints from group photo.")
        except Exception as e:
            print(f"Could not find faces or create embeddings in group photo: {e}")
            unknown_fingerprints = []
        # --- END OF NEW LOGIC ---

        present_student_ids = set()
        DISTANCE_THRESHOLD = 0.40

        for student in student_embeddings_data:
            known_embedding = student['embedding']
            for unknown_fp in unknown_fingerprints:
                distance = find_cosine_distance(known_embedding, unknown_fp)
                if distance <= DISTANCE_THRESHOLD:
                    present_student_ids.add(student['id'])
                    break

        return jsonify({"present_student_ids": list(present_student_ids)})

    except Exception as e:
        print(f"Error in /recognize: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)