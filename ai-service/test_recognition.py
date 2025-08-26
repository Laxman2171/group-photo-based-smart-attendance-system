from deepface import DeepFace

# Define the paths to our two test images
img1_path = "test_images\Shrinath Photo.jpg"
img2_path = "test_images\Shrinath photo 1.jpg" # A DIFFERENT person

# We will also compare person1 to themselves to make sure it works
img1_again_path = "test_images/person1.jpg" 

try:
    print("--- Test 1: Comparing two DIFFERENT people ---")
    # This function compares two images and tells us if it's the same person.
    # It will download a lighter 'VGG-Face' model the first time.
    result_diff = DeepFace.verify(img1_path=img1_path, img2_path=img2_path)
    print(result_diff)
    print("Are they the same person?", result_diff["verified"])

    print("\n--- Test 2: Comparing two IDENTICAL people ---")
    result_same = DeepFace.verify(img1_path=img1_path, img2_path=img1_again_path)
    print(result_same)
    print("Are they the same person?", result_same["verified"])

except Exception as e:
    print(f"An error occurred: {e}")