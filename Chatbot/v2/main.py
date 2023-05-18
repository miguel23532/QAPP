#importing the libraries
import tensorflow as tf
import numpy as np
import pandas as pd
import json
import nltk
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.layers import Input, Embedding, LSTM , Dense,GlobalMaxPooling1D,Flatten
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import socketio
import asyncio
import string
import random
sio = socketio.AsyncClient()

async def botStart():
  print("dentro de botStart")
  try:
    print("connect")
    await sio.connect('http://*IP SERVIDOR*:3001')
    print("emit")
    await sio.emit('connection', {'foo': 'bar'})
  except:
    return not True


tf.test.is_gpu_available('GPU')

#importing the dataset
with open('content.json', 'r', encoding='utf-8') as content:
  data1 = json.load(content)

#getting all the data to lists
tags = []
inputs = []
responses={}
for intent in data1['intents']:
  responses[intent['tag']]=intent['responses']
  for lines in intent['input']:
    inputs.append(lines)
    tags.append(intent['tag'])

#converting to dataframe
data = pd.DataFrame({"inputs":inputs,"tags":tags})

data = data.sample(frac=1)

#removing punctuations

data['inputs'] = data['inputs'].apply(lambda wrd:[ltrs.lower() for ltrs in wrd if ltrs not in string.punctuation])
data['inputs'] = data['inputs'].apply(lambda wrd: ''.join(wrd))

#tokenize the data que los datos sean numeros

tokenizer = Tokenizer(num_words=2000)
tokenizer.fit_on_texts(data['inputs'])
train = tokenizer.texts_to_sequences(data['inputs'])
#apply padding ponerle ceros a los datos para completar cadenas :u

x_train = pad_sequences(train)

#encoding the outputs ahora pone un valor numerico a los tags

le = LabelEncoder()
y_train = le.fit_transform(data['tags'])

input_shape = x_train.shape[1]
print(input_shape)

#define vocabulary
vocabulary = len(tokenizer.word_index)
print("number of unique words : ",vocabulary)
output_length = le.classes_.shape[0]
print("output length: ",output_length)

#creating the model
#el modelo contiene capas de entrada, incrustación, LSTM, aplanamiento y densas.



i = Input(shape=(input_shape,))
x = Embedding(vocabulary+1,10)(i)
x = LSTM(10,return_sequences=True)(x)
x = Flatten()(x)
x = Dense(output_length,activation="softmax")(x)
model  = Model(i,x)
print("input:")
print(i)
#compiling the model
model.compile(loss="sparse_categorical_crossentropy",optimizer='adam',metrics=['accuracy'])

#training the model
train = model.fit(x_train,y_train,epochs=220)


#plotting model accuracy
plt.plot(train.history['accuracy'],label='training set accuracy')
plt.plot(train.history['loss'],label='training set loss')
plt.legend()

ruta_archivo = "C:/Users/m/Desktop/otras cosas/modular/QmonoBot/v2/preguntaRespuesta.txt"

#chatting

async def askBot(question):

  texts_p = []
  prediction_input = question

  #removing punctuation and converting to lowercase
  prediction_input = [letters.lower() for letters in prediction_input if letters not in string.punctuation]
  prediction_input = ''.join(prediction_input)
  texts_p.append(prediction_input)

  #tokenizing and padding
  
  prediction_input = tokenizer.texts_to_sequences(texts_p)
  prediction_input = np.array(prediction_input).reshape(-1)
  prediction_input = pad_sequences([prediction_input],input_shape)
  
  #getting output from model
  output = model.predict(prediction_input)
  output = output.argmax()

  #finding the right tag and predicting
  response_tag = le.inverse_transform([output])[0]
  respuesta = str(random.choice(responses[response_tag]))
  r = [response_tag,respuesta]
  return r
#   if response_tag == "despedida":
#     break

# @sio.on("pregunta")
# def my_event(event, data):
#   print(event)
#   sio.emit('respuesta', askBot(data))

@sio.on('pregunta')
async def on_EdgarEsPuto(data):
  print("pregunta recibida")
  print(data)
  respuesta = await askBot(data[1])
  print(respuesta)
  respuestaMsj = [data[0],respuesta[1],respuesta[0]]
  print(respuestaMsj)
  with open(ruta_archivo, mode="a", encoding="utf-8") as archivo:
    nuevos_datos = data[1] + "/" + respuesta[0] + "/" + respuestaMsj[1]
    archivo.write("\n" + nuevos_datos)
    archivo.close()

  await sio.emit('respuesta', respuestaMsj)

async def main():
  print("iniciado")
  while True:
    
    await botStart()
    
    await asyncio.sleep(10)

    

try:
  asyncio.run(main())
except:
  print("no sirve")

