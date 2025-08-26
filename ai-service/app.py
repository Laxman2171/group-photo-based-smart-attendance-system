from flask import Flask, request, jsonify
from deepface import DeepFace
import requests
import numpy as np
import cv2 # OpenCV is used to handle the images

app = Flask(__name__)

# Helper function to download an image from a URL and load it
def url_to_image(url):
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status() # Raise an error if the download fails
        image_array = np.frombuffer(response.content, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        print(f"Error loading image from {url}: {e}")
        return None

# This is our main AI endpoint
@app.route('/recognize', methods=['POST'])
def recognize_faces():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON input"}), 400

        group_photo_url = data.get('group_photo_url')
        student_data = data.get('student_data') # A list of students like [{"id": "...", "photo_url": "..."}]

        if not group_photo_url or not student_data:
            return jsonify({"error": "Missing group_photo_url or student_data"}), 400

        print("Loading group photo...")
        group_image = url_to_image(group_photo_url)
        if group_image is None:
            return jsonify({"error": "Could not load group photo"}), 400

        # Find all faces in the large group photo first
        try:
            # This finds every face and extracts it as a small image
            faces_in_group = DeepFace.extract_faces(img_path=group_image, detector_backend='opencv')
        except ValueError:
            print("No faces detected in the group photo.")
            return jsonify({"present_student_ids": []}) # Return empty list if no faces found

        present_student_ids = set() # Use a set to avoid duplicates

        print(f"Found {len(faces_in_group)} faces. Comparing against {len(student_data)} students...")

        # Loop through each student we know should be in the class
        for student in student_data:
            print(f"  - Verifying student: {student['id']}")
            student_image = url_to_image(student['photo_url'])
            if student_image is None:
                continue # Skip if we can't download this student's photo

            # Compare this one known student against all the unknown faces we found
            for unknown_face_data in faces_in_group:
                unknown_face_img = unknown_face_data['face']

                # The verify function is the magic!
                result = DeepFace.verify(
                    img1_path=student_image,
                    img2_path=unknown_face_img,
                    model_name="VGG-Face",
                    enforce_detection=False # We already found the faces
                )

                if result['verified']:
                    print(f"    --> MATCH FOUND for student {student['id']}")
                    present_student_ids.add(student['id'])
                    break # Move to the next student once we've found this one

        print("Recognition complete.")
        return jsonify({"present_student_ids": list(present_student_ids)})

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)