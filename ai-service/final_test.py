import cv2
from deepface import DeepFace

print("--- RUNNING FINAL ISOLATION TEST ---")

# Define the path to the single image we will test
img_path = "test_images/test_photo.jpg"

try:
    # Load the image using OpenCV
    img1 = cv2.imread(img_path)
    if img1 is None:
        raise ValueError(f"Could not read the image from path: {img_path}. Make sure the file exists and is a valid image.")

    # CRITICAL STEP: Convert from BGR (OpenCV's default) to RGB (DeepFace's requirement)
    img1_rgb = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
    print("Successfully loaded image.")

    # For this test, we compare the image against itself.
    img2_rgb = img1_rgb

    # Run verification
    print("\nVerifying the image against itself... This may take a moment to load the model.")
    result = DeepFace.verify(
        img1_path = img1_rgb, 
        img2_path = img2_rgb, 
        model_name="Facenet",
        enforce_detection=False # We are giving it a pre-cropped face, so no need to detect again
    )

    print("\n--- FINAL RESULT ---")
    print(result)
    print("--------------------")

except Exception as e:
    print(f"AN ERROR OCCURRED: {e}")