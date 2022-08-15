export async function createShaderModule(code: string, device: GPUDevice) {
  const sm = device.createShaderModule({ code });

  if ("compilationInfo" in sm) {
    const compilationInfo = await sm.compilationInfo();
    if (compilationInfo.messages.length > 0) {
      let hadError = false;
      console.log("Shader compilation log:");
      for (let i = 0; i < compilationInfo.messages.length; ++i) {
        const msg = compilationInfo.messages[i];
        console.log(`${msg.lineNum}:${msg.linePos} - ${msg.message}`);
        hadError = hadError || msg.type == "error";
      }
      if (hadError) {
        console.log("Shader failed to compile");
        return;
      }
    }
  }

  return sm;
}
