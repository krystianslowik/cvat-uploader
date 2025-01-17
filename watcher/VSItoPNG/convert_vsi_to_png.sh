#!/bin/bash

# Default values for parameters
MIN_WIDTH=7000
MIN_HEIGHT=5000
VSI_DIR="./vsi"
OUTPUT_DIR="./png"
LOG_DIR="./logs"
BFPATH="./bftools"
HEAP_SIZE="8G"

# Function to display help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  -w, --min-width <width>      Minimum width of series to process (default: $MIN_WIDTH)"
    echo "  -h, --min-height <height>    Minimum height of series to process (default: $MIN_HEIGHT)"
    echo "  -v, --vsi-dir <directory>    Directory containing .vsi files (default: $VSI_DIR)"
    echo "  -o, --output-dir <directory> Directory to save output images (default: $OUTPUT_DIR)"
    echo "  -l, --log-dir <directory>    Directory to save logs (default: $LOG_DIR)"
    echo "  -b, --bftools-dir <directory> Path to the bftools directory (default: $BFPATH)"
    echo "  -m, --heap-size <size>       Java heap size (e.g., 8G, 16G; default: $HEAP_SIZE)"
    echo "  -h, --help                   Show this help message"
    exit 0
}

# Parse command-line arguments
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        -w|--min-width) MIN_WIDTH="$2"; shift ;;
        -h|--min-height) MIN_HEIGHT="$2"; shift ;;
        -v|--vsi-dir) VSI_DIR="$2"; shift ;;
        -o|--output-dir) OUTPUT_DIR="$2"; shift ;;
        -l|--log-dir) LOG_DIR="$2"; shift ;;
        -b|--bftools-dir) BFPATH="$2"; shift ;;
        -m|--heap-size) HEAP_SIZE="$2"; shift ;;
        --help|-h) show_help ;;
        *) echo "Unknown parameter: $1"; show_help ;;
    esac
    shift
done

# Create necessary directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$LOG_DIR"

# Log file path
LOG_FILE="$LOG_DIR/bfconvert.log"

# Process each .vsi file in the ./vsi directory
for VSI_FILE in "$VSI_DIR"/*.vsi; do
    echo "Processing $VSI_FILE..."

    # Extract metadata and filter relevant series
    java -Xmx"$HEAP_SIZE" -cp "$BFPATH/bioformats_package.jar:$BFPATH/log4j.jar" \
        loci.formats.tools.ImageInfo "$VSI_FILE" | awk -v min_width="$MIN_WIDTH" -v min_height="$MIN_HEIGHT" '
    BEGIN { series = -1 }
    /^Series #/ { series++; }
    /^.*Width = / { width = $3; }
    /^.*Height = / { height = $3;
        if (width >= min_width && height >= min_height) {
            print series, width, height;
        }
    }' > relevant_series.txt

    echo "Relevant series for $VSI_FILE:"
    cat relevant_series.txt

    # Export each relevant series as PNG
    while read -r series width height; do
        echo "Exporting series $series (Width: $width, Height: $height) from $VSI_FILE..."
        java -Xmx"$HEAP_SIZE" -cp "$BFPATH/bioformats_package.jar:$BFPATH/log4j.jar" \
            loci.formats.tools.ImageConverter \
            -series "$series" "$VSI_FILE" "$OUTPUT_DIR/$(basename "$VSI_FILE" .vsi)_series_${series}.png" >> "$LOG_FILE" 2>&1
    done < relevant_series.txt
done

echo "Processing complete. Logs saved in $LOG_FILE, output saved in $OUTPUT_DIR."