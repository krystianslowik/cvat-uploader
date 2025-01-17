# VSI Image Processor

This project provides a script for processing `.vsi` image files, extracting relevant series based on specified dimensions, and exporting them as PNG files. It leverages the Bio-Formats tools (`bftools`) and includes robust logging with `log4j` for tracking the processing steps.

---

## **Project Structure**

```
.
├── convert_vsi_to_png.sh         # Main script for processing `.vsi` files
├── vsi/                          # Directory containing `.vsi` files to process
├── png/                          # Directory where processed images are saved
├── logs/                         # Directory where logs are stored
├── bftools/                      # Directory containing Bio-Formats tools
│   ├── bioformats_package.jar    # Bio-Formats main library
│   ├── log4j.jar                 # Log4j library for logging
│   └── other bftools files...
└── README.md                     # Documentation for the project
```

---

## **Requirements**

### **1. System Requirements**
- **Operating System**: Linux or macOS (Windows with minor modifications).
- **Java**: JRE 8 or higher.

### **2. Tools and Libraries**
- **Bio-Formats Tools** (`bftools`): Available at [Open Microscopy Bio-Formats Tools](https://downloads.openmicroscopy.org/bio-formats/).
- **Log4j**: Included in the `bftools` directory.

### **3. Permissions**
Ensure the script has execute permissions:
```bash
chmod +x convert_vsi_to_png.sh
```

---

## **Usage**

### **1. Basic Usage**
Run the script with default settings:
```bash
./convert_vsi_to_png.sh
```

### **2. Custom Parameters**
The script supports several customizable options:

```bash
Usage: ./convert_vsi_to_png.sh [options]

Options:
  -w, --min-width <width>      Minimum width of series to process (default: 7000)
  -h, --min-height <height>    Minimum height of series to process (default: 5000)
  -v, --vsi-dir <directory>    Directory containing .vsi files (default: ./vsi)
  -o, --output-dir <directory> Directory to save output images (default: ./output_relevant)
  -l, --log-dir <directory>    Directory to save logs (default: ./logs)
  -b, --bftools-dir <directory> Path to the bftools directory (default: ./bftools)
  -m, --heap-size <size>       Java heap size (e.g., 8G, 16G; default: 8G)
  -h, --help                   Show this help message
```

### **3. Example Commands**

- **Process all `.vsi` files in a custom directory**:
  ```bash
  ./convert_vsi_to_png.sh --vsi-dir /path/to/vsi/files --output-dir ./results
  ```

- **Increase Java heap size to process larger files**:
  ```bash
  ./convert_vsi_to_png.sh --heap-size 16G
  ```

- **Process only series larger than 10,000 x 8,000 pixels**:
  ```bash
  ./convert_vsi_to_png.sh --min-width 10000 --min-height 8000
  ```

---

## **How It Works**

1. **Metadata Extraction**:
   - The script uses `loci.formats.tools.ImageInfo` to extract metadata from `.vsi` files.
   - It filters series based on the minimum width and height specified.

2. **Image Export**:
   - Relevant series are exported as PNG files using `loci.formats.tools.ImageConverter`.

3. **Logging**:
   - All logs are stored in the `./logs/bfconvert.log` file for review.

---

## **Logs**

Logs are saved in the `./logs/` directory. Each execution appends new logs to `bfconvert.log`.

Example log entry:
```
2025-01-16 12:34:56 [main] INFO loci.formats.tools.ImageConverter - Exporting series 13 from file1.vsi
2025-01-16 12:35:10 [main] INFO loci.formats.tools.ImageConverter - Completed export: output_relevant/file1_series_13.png
```

---

## **Known Issues**

1. **Out of Memory Errors**:
   - Increase the heap size using the `--heap-size` option (e.g., `--heap-size 16G`).

2. **Unsupported Formats**:
   - Ensure `.vsi` files are compatible with Bio-Formats tools.

3. **Empty Output**:
   - Verify `MIN_WIDTH` and `MIN_HEIGHT` values are appropriate for your data.

---

## **Support**
For issues or questions, please refer to:
- [Bio-Formats Documentation](https://docs.openmicroscopy.org/bio-formats/)
- [Log4j Documentation](https://logging.apache.org/log4j/)

Or contact the project maintainer.

---

## **License**
This project is licensed under the MIT License.


