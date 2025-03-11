import os
import tempfile

temp_dir = tempfile.gettempdir()

print(f"Deleting files in temp directory: {temp_dir}")

for file_name in os.listdir(temp_dir):
    file_path = os.path.join(temp_dir, file_name)
    try:
        if os.path.isfile(file_path):
            os.remove(file_path)
            print(f"Deleted: {file_path}")
    except Exception as e:
        print(f"Could not delete {file_path}: {e}")
