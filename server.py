import base64
import io


from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from idm_vton import TryonPipeline, start_tryon
from PIL import Image

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # Adjust this to be more specific in production
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.post("/store_user_image")
async def store_user_image(file: UploadFile = File(...)):
  contents = await file.read()
  image = Image.open(io.BytesIO(contents))

  user_image_path = "user_images/full_body.jpg"
  image.save(user_image_path)

  return {"message": "User image stored successfully"}


@app.post("/tryon")
async def virtual_tryon(garment_image: UploadFile = File(...)):
  #  
  user_image_path = "user_images/full_body.jpg"
  user_image = Image.open(user_image_path)

  garment_contents = await garment_image.read()
  garment_image = Image.open(io.BytesIO(garment_contents))

  pipeline = TryonPipeline.from_pretrained("path/to/model")

  result_image = pipeline(user_image, garment_image)

  buffered = io.BytesIO()
  result_image.save(buffered, format="PNG")
  img_str = base64.b64encode(buffered.getvalue()).decode()

  return {"result_image": img_str}
  return {"result_image": img_str}
