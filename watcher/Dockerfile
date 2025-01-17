# Base image with Java for bftools
FROM openjdk:11-jre-slim

# Install Python, pip, and required dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    bash \
    xvfb \
    libxrender1 \
    libxtst6 \
    libxi6 \
    libxext6 \
    libfreetype6 \
    openjdk-11-jdk \
    zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /watcher

# Copy the watcher script
COPY watcher.py .
COPY entrypoint.sh .

# Copy the shared database module
COPY database.py /watcher/database.py

# Copy VSItoPNG tools (fixed path)
COPY VSItoPNG /watcher/VSItoPNG

# Ensure execution permissions for scripts
RUN chmod +x /watcher/VSItoPNG/convert_vsi_to_png.sh \
    && chmod +x /watcher/VSItoPNG/bftools/* \
    && chmod +x /watcher/entrypoint.sh

# Install Python dependencies
RUN pip3 install sqlalchemy psycopg2-binary

# Set default command to add a delay before starting the watcher
CMD ["/bin/bash", "-c", "echo 'chej xDD' && ./entrypoint.sh"]