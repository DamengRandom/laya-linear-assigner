const { Laya } = require("@receptron/laya");

(async () => {
  console.log("开始下载 Laya 模型权重...");
  const laya = await Laya.load({
    onProgress: ({ file, received, total }) => {
      const percent = ((received / total) * 100).toFixed(1);
      console.log(`  ${file}: ${percent}%`);
    },
  });
  console.log("下载完成！");
  await laya.close();
})();
