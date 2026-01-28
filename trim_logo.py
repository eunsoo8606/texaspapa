from PIL import Image
import os

def trim_image(input_path, output_path):
    """
    이미지의 투명/흰색 여백을 자동으로 제거합니다.
    """
    # 이미지 열기
    img = Image.open(input_path)
    
    # RGBA 모드로 변환 (투명도 처리)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 이미지 데이터 가져오기
    bbox = img.getbbox()
    
    if bbox:
        # 여백 제거
        img_cropped = img.crop(bbox)
        
        # 저장
        img_cropped.save(output_path, 'WEBP', quality=95)
        print(f"✅ 이미지 트리밍 완료!")
        print(f"   원본 크기: {img.size}")
        print(f"   트리밍 후: {img_cropped.size}")
        print(f"   저장 위치: {output_path}")
    else:
        print("❌ 트리밍할 영역을 찾을 수 없습니다.")

if __name__ == "__main__":
    # 경로 설정
    input_file = r"d:\현수_랜딩페이지\texaspapa\public\images\logo.webp"
    output_file = r"d:\현수_랜딩페이지\texaspapa\public\images\logo_trimmed.webp"
    
    # 파일 존재 확인
    if not os.path.exists(input_file):
        print(f"❌ 파일을 찾을 수 없습니다: {input_file}")
    else:
        trim_image(input_file, output_file)
        print("\n💡 트리밍된 이미지를 사용하려면:")
        print("   nav.ejs에서 /images/logo.webp를 /images/logo_trimmed.webp로 변경하세요.")
