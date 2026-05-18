#!/bin/bash
# Regenerate wallpapers with correct JPEG format
# Using SiliconFlow API
set -e

API_KEY="${SILICONFLOW_API_KEY:-sk-uottehcrzkoioynbvilbnekxvbvvnncyryhpydwjuoeopxep}"
API_URL="https://api.siliconflow.cn/v1/images/generations"
OUTPUT_DIR="/home/admin/ai-wallpaper-generator/public/wallpapers"
MODEL="Kwai-Kolors/Kolors"
WIDTH=1920
HEIGHT=1080

mkdir -p "$OUTPUT_DIR"

# Prompts for 15 wallpaper styles — keep the same themes
declare -a PROMPTS
PROMPTS[1]="Majestic mountain sunrise with golden light piercing through mist, cinematic lighting, ultra-detailed landscape photography, 8K"
PROMPTS[2]="Enchanted forest path with sunbeams filtering through ancient trees, magical atmosphere, mossy ground, photorealistic"
PROMPTS[3]="Dramatic ocean wave crashing at sunset, turquoise water with white foam, golden hour light, seascape photography"
PROMPTS[4]="Brilliant northern lights dancing over a snowy arctic landscape, emerald and purple aurora, starry sky, wide angle"
PROMPTS[5]="Neon-lit futuristic city at night with rain-slicked streets, cyberpunk aesthetic, towering skyscrapers, reflections"
PROMPTS[6]="Japanese cherry blossom garden in full bloom, pink petals falling, traditional wooden bridge over koi pond, serene"
PROMPTS[7]="Deep space nebula with vibrant colors, cosmic dust clouds in purple and orange, distant stars, astronomical art"
PROMPTS[8]="Golden sand dunes at sunset with long shadows, rolling desert landscape, warm orange tones, minimalist composition"
PROMPTS[9]="Powerful waterfall cascading into a crystal clear pool surrounded by lush green forest, rainbow in the mist"
PROMPTS[10]="Endless lavender field under a blue sky with fluffy white clouds, Provence countryside, vibrant purple rows"
PROMPTS[11]="Snow-capped mountain peaks at dawn with pink alpenglow, alpine lake reflection, crisp winter landscape"
PROMPTS[12]="Tropical paradise beach with white sand, crystal clear turquoise water, palm trees swaying in breeze"
PROMPTS[13]="Vibrant abstract geometric art with flowing curves, bold colors blending from purple to gold to teal, modern"
PROMPTS[14]="Crystal cave with glowing blue ice formations, ethereal light filtering through crystal structures, fantasy"
PROMPTS[15]="Peaceful zen garden with raked sand patterns, bonsai tree, stepping stones, bamboo fence, minimalist Japanese"

# Function to generate a single image
generate_one() {
    local i=$1
    local prompt="${PROMPTS[$i]}"
    local outfile="$OUTPUT_DIR/$(printf '%02d' $i)-$(echo "${prompt:0:20}" | sed 's/ //g').jpg"
    
    echo "[$i/15] Generating: $prompt"
    
    local json_payload=$(cat <<EOF
{
  "model": "$MODEL",
  "prompt": "$prompt",
  "n": 1,
  "size": "${WIDTH}x${HEIGHT}"
}
EOF
    )

    local response=$(curl -s -w "\n%{http_code}" "$API_URL" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "$json_payload")
    
    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" != "200" ]; then
        echo "  ERROR (HTTP $http_code): $body"
        return 1
    fi
    
    # Extract image URL from response
    local image_url=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',[{}])[0].get('url','') or d.get('images',[{}])[0].get('url',''))" 2>/dev/null)
    
    if [ -z "$image_url" ]; then
        echo "  ERROR: No image URL in response"
        echo "  Response: $body" | head -c 500
        return 1
    fi
    
    # Download and save as JPEG
    curl -s -L -o "$outfile" "$image_url"
    
    # Check file
    local file_type=$(file "$outfile")
    if echo "$file_type" | grep -q "PNG"; then
        # Convert PNG to JPEG
        convert "$outfile" -quality 95 "$outfile"
        echo "  -> Converted PNG to JPEG"
    fi
    
    local file_size=$(stat -c%s "$outfile" 2>/dev/null || stat -f%z "$outfile" 2>/dev/null)
    echo "  -> Saved: $outfile ($file_size bytes)"
}

echo "=== Regenerating 15 wallpapers === "
echo "Model: $MODEL"
echo "Size: ${WIDTH}x${HEIGHT}"
echo "Output: $OUTPUT_DIR"
echo ""

for i in $(seq 1 15); do
    generate_one $i
    # Rate limit: wait 2 seconds between requests
    if [ $i -lt 15 ]; then
        sleep 2
    fi
done

echo ""
echo "=== Done! ==="
ls -lh "$OUTPUT_DIR"/*.jpg 2>/dev/null || echo "No .jpg files found"
