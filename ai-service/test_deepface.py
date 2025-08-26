print("--- SCRIPT STARTED ---")

# 1. Import the library
print("1. Importing DeepFace...")
from deepface import DeepFace
print("   Import successful.")

# 2. Define the image path
print("2. Setting image path...")
# !!! MAKE SURE this file actually exists: test_images/person1.jpg !!!
image_path = "Shrinath Photo.jpg"
print(f"   Image path is: {image_path}")

# 3. Run the analysis (THE MOST IMPORTANT STEP)
print("3. Calling DeepFace.analyze()... THIS IS THE TEST.")
# The script will try to download models here if they are missing
analysis_result = DeepFace.analyze(img_path=image_path, actions=['age', 'gender', 'emotion'], enforce_detection=False)
print("   DeepFace.analyze() FINISHED.")

# 4. Print the result
print("4. Printing results...")
print(analysis_result)

print("--- SCRIPT FINISHED SUCCESSFULLY ---")