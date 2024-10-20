import io
import os
import time
from typing import List

import pillow_heif
import requests
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel


class ImageList(BaseModel):
  images: List[str]


app = FastAPI()

app.add_middleware(
  CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

app.mount("/user_images", StaticFiles(directory="user_images"), name="user_images")


@app.get("/get_user_image")
async def get_user_image():
  user_image_path = "user_images/full_body.jpg"
  if os.path.exists(user_image_path):
    return FileResponse(user_image_path)
  return {"error": "User image not found"}


@app.post("/store_user_image")
async def store_user_image(file: UploadFile = File(...)):
  try:
    contents = await file.read()
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension in ["heic", "heif"]:
      heif_file = pillow_heif.read_heif(contents)
      image = Image.frombytes(heif_file.mode, heif_file.size, heif_file.data, "raw", heif_file.mode, heif_file.stride)
    else:
      image = Image.open(io.BytesIO(contents))

    user_image_dir = "user_images"
    os.makedirs(user_image_dir, exist_ok=True)

    user_image_path = os.path.join(user_image_dir, "full_body.jpg")
    image.save(user_image_path, format="JPEG")

    base_url = "http://localhost:8000"

    data = {
      "img_path": f"{base_url}/user_images/full_body.jpg?t={time.time()}",
      "message": "User image stored successfully",
    }
    return data
  except Exception as e:
    print(f"Error storing user image: {str(e)}")
    raise HTTPException(status_code=500, detail="An error occurred while storing the user image")


@app.post("/try_on")
async def try_on(garment_image: str = Form(...), user_image: UploadFile = File(...)):
  tryon_dir = "tryon_images"
  os.makedirs(tryon_dir, exist_ok=True)

  user_contents = await user_image.read()
  user_img = Image.open(io.BytesIO(user_contents))
  tryon_user_img_path = os.path.join(tryon_dir, "user_image.jpg")
  user_img.save(tryon_user_img_path, format="JPEG")

  garment_response = requests.get(garment_image)
  garment_img = Image.open(io.BytesIO(garment_response.content))
  garment_img_path = os.path.join(tryon_dir, "garment_image.jpg")
  garment_img.save(garment_img_path, format="JPEG")

  print("User Image saved at:", tryon_user_img_path)
  print("Garment Image saved at:", garment_img_path)

  # TODO virtual try-on model logic heres

  return {"message": "Images saved for try-on", "user_image": tryon_user_img_path, "garment_image": garment_img_path}


"""
TODO 
input - images
output - non-model, front-facing garment images detected by detection model
"""


@app.post("/filter_images")
async def filter_images(image_list: ImageList):
  if not image_list.images:
    raise HTTPException(status_code=400, detail="No images provided")
  # TODO Detection Model filtering logic
  data = {"filteredImages": image_list.images}
  return data
