import numpy as np
import requests
from huggingface_hub import hf_hub_url
from tensorflow.keras.models import load_model
from huggingface_hub import hf_hub_download
from PIL import Image
import io
import os
import tempfile

class TomatoDiseaseModel:
    _instance = None
    _model = None
    _labels = [
        "Tomato Bacterial spot", "Tomato Early blight", "Tomato Healthy", "Tomato Late blight",
        "Tomato Leaf Mold", "Tomato Mosaic virus", "Tomato Septoria leaf spot", "Tomato Spider mites",
        "Tomato Target Spot", "Tomato Yellow Leaf Curl Virus"
    ]

    def __init__(self, repo_id="Shinde-2005/Tomato_Disease_Prediction", filename="tomato_disease_prediction_model.keras"):
        self.repo_id = repo_id
        self.filename = filename
        self._load_model()

    def _load_model(self):
        if self._model is None:
            # 1. Get the direct download URL from Hugging Face
            model_url = hf_hub_url(repo_id=self.repo_id, filename=self.filename)

            # 2. Create a temporary directory
            with tempfile.TemporaryDirectory() as tmpdir:
                # 3. Define the path for the temporary file
                tmp_model_path = os.path.join(tmpdir, self.filename)

                # 4. Download the file using 'requests' and save it to the temporary path
                with requests.get(model_url, stream=True) as r:
                    r.raise_for_status()
                    with open(tmp_model_path, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)
                
                # 5. Load the model from the successfully downloaded temporary file
                self._model = load_model(tmp_model_path)

    def predict_disease(self, image_bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((224, 224))
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        preds = self._model.predict(img_array)[0]
        top_idx = int(np.argmax(preds))
        return {
            "disease": self._labels[top_idx],
            "confidence": float(preds[top_idx]),
            "all_predictions": preds.tolist()
        }

# Singleton
tomato_disease_model = TomatoDiseaseModel()
