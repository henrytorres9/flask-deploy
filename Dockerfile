# Utiliza una imagen base de Python 3.9
FROM python:3.9

# Instala libGL.so.1 y otras dependencias
RUN apt-get update && apt-get install -y libgl1-mesa-glx

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo requirements.txt y luego instala las dependencias
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copia el resto del código de tu aplicación
COPY . .

# Comando para iniciar tu aplicación Flask con Gunicorn
CMD ["gunicorn", "main:app"]
