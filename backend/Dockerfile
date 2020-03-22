FROM python:3.8.1

EXPOSE 5000
WORKDIR /opt/app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY src/* ./

ENTRYPOINT ["python", "app.py"]
