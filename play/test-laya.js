const { Laya } = require("@receptron/laya");

(async () => {
  console.log("正在加载 Laya 模型...");
  const laya = await Laya.load();

  console.log("模型加载成功！正在执行第一个决策...");

  const result = await laya.systemOne(
    // 状态：一段文本，比如一封邮件
    {
      subject: "Refund not received",
      body: "I cancelled two weeks ago and still have no refund. Please help.",
    },
    // 问题：让 Laya 判断这封邮件应该给哪个团队
    {
      department: {
        type: "choice",
        instructions: "Which team should handle this ticket?",
        criteria: {
          billing: "payments, refunds, invoices",
          support: "product help and bugs",
          sales: "new purchases",
        },
      },
    }
  );

  console.log("决策结果：");
  console.log("  推荐团队:", result.answers.department.choice);
  console.log("  各团队概率:", result.answers.department.probabilities);

  await laya.close();
  console.log("完成！");
})();
