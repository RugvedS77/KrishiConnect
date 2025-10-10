import numpy as np
from tensorflow.keras.models import load_model
from huggingface_hub import hf_hub_download
from PIL import Image
import io
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
            with tempfile.TemporaryDirectory() as tmpdir:
            # Download the model file into the temporary directory
                model_path = hf_hub_download(
                    repo_id=self.repo_id,
                    filename=self.filename,
                    cache_dir=tmpdir
                )
                # Load the model from that temporary path
                self._model = load_model(model_path)

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
