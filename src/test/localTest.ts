import routeTask from "../taskDistributor";

async function testRouteTask() {
  const result = await routeTask({
    name: "landing page development",
    description: "We need to create a new landing page current customer care portal website",
  });

  console.log(result);
}

testRouteTask();
