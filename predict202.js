// Removed predictOnLoad function to avoid automatic predictions on page load
function simulateClick(tabID) {
  if (validateFormFields()) {
    document.getElementById(tabID).click();
  }
}
$("#image-selector").change(function () {
  let reader = new FileReader();
  reader.onload = function () {
    let dataURL = reader.result;
    $("#selected-image").attr("src", dataURL);
    $("#prediction-list").empty(); // Clear old results
  };

  let file = $("#image-selector").prop("files")[0];
  reader.readAsDataURL(file);

  // Simulate a click on the predict button after the image is loaded
  setTimeout(simulateClick.bind(null, "predict-button"), 500);
});

let model;
(async function () {
  model = await tf.loadModel("model.json");

  // Hide the model loading spinner
  $(".progress-bar").hide();
})();

$("#predict-button").click(async function () {
  let image = $("#selected-image").get(0);

  // Pre-process the image
  let tensor = tf.fromPixels(image).resizeNearestNeighbor([224, 224]).toFloat();

  let offset = tf.scalar(127.5);

  tensor = tensor.sub(offset).div(offset).expandDims();

  // Pass the tensor to the model and call predict on it
  let predictions = await model.predict(tensor).data();
  let top5 = Array.from(predictions)
    .map(function (p, i) {
      return {
        probability: p,
        className: SKIN_CLASSES[i],
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 3);

  $("#prediction-list").empty();
  top5.forEach(function (p) {
    $("#prediction-list").append(`
		<li class="prediction-item">
		   <span class="disease-name">${p.className}</span>: 
		  <span class="accuracy">${(p.probability * 100).toFixed(2)}%</span>
		</li>
	  `);
  });

  // Prepare data for the bar chart
  const labels = top5.map((p) => p.className);
  const data = top5.map((p) => p.probability * 100); // Convert to percentage

  // Create or update the bar chart
  const ctx = document.getElementById("prediction-chart").getContext("2d");
  ctx.font = "bold 10pt Courier";
  if (window.barChart) {
    window.barChart.destroy(); // Destroy the previous chart if it exists
  }

  window.barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Probability Prediction (%)",
          data: data,
          backgroundColor: "rgba(4, 59, 92,1)",
          borderColor: "(4, 59, 92,1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10,
          },
        },
      },
    },
  });
});
