package br.com.b8.safe.b8safeframeprocessor;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.mrousavy.camera.frameprocessors.Frame;
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin;
import com.mrousavy.camera.frameprocessors.VisionCameraProxy;
import java.util.Map;

import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.media.Image;
import android.util.Base64;
import android.util.Log;

public class B8SafeFrameProcessorPlugin extends FrameProcessorPlugin {
  public B8SafeFrameProcessorPlugin(@NonNull VisionCameraProxy proxy, @Nullable Map<String, Object> options) {
    super();
  }

  @Nullable
  @Override
  public Object callback(@NonNull Frame frame, @Nullable Map<String, Object> arguments) {
    try {
      // Parse and validate resolutionMultiplier
      float resolutionMultiplier = Float.parseFloat(arguments.get("resolutionMultiplier").toString());
      int scale = Math.round(resolutionMultiplier * 100);

      // Get image from frame
      Image image = frame.getImage();
      if (image == null) {
        Log.e("BRBTC_LOG", "Failed to get image from frame");
        return null;
      }

      // Get YUV buffers
      ByteBuffer yBuffer = image.getPlanes()[0].getBuffer();
      ByteBuffer uBuffer = image.getPlanes()[1].getBuffer();
      ByteBuffer vBuffer = image.getPlanes()[2].getBuffer();

      // Calculate buffer sizes
      int ySize = yBuffer.remaining();
      int uSize = uBuffer.remaining();
      int vSize = vBuffer.remaining();

      // Allocate NV21 buffer
      byte[] nv21 = new byte[ySize + uSize + vSize];

      // Copy YUV data to NV21 buffer (U and V are swapped)
      yBuffer.get(nv21, 0, ySize);
      vBuffer.get(nv21, ySize, vSize);
      uBuffer.get(nv21, ySize + vSize, uSize);

      // Create YuvImage
      YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, image.getWidth(), image.getHeight(), null);

      // Compress YuvImage to JPEG
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      boolean success = yuvImage.compressToJpeg(new Rect(0, 0, yuvImage.getWidth(), yuvImage.getHeight()), scale, out);
      if (!success) {
        Log.e("BRBTC_LOG", "Failed to compress YuvImage to JPEG");
        return null;
      }

      // Convert JPEG to Base64
      byte[] imageBytes = out.toByteArray();
      String result = Base64.encodeToString(imageBytes, Base64.DEFAULT);

      // Log result
      Log.v("BRBTC_LOG", result);

      // Return result
      return result;
    } catch (Exception e) {
      Log.e("BRBTC_LOG", "Error processing frame", e);
      return null;
    }
  }
}