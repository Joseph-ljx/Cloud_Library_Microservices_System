// Kafka:

const { Kafka } = require("kafkajs");
const brokers = ["44.214.218.139:9092", "44.214.213.141:9092"];

// Publish topic

const topic = "jianxian.customer.evt";

// Create the kafka:
const kafka = new Kafka({
  clientId: "jianxian-app",
  brokers: brokers,
});

/**
 * A method that create a Kafka object and connect
 */
async function runKafka(data) {
  // Create a Kafka producer and connect:

  const producer = kafka.producer();
  await producer.connect();

  /**
   * Send the message
   */
  await producer
    .send({
      topic: topic,
      messages: [{ value: JSON.stringify(data) }],
    })
    .then((result) => {
      console.log(`Message sent to Kafka: ${JSON.stringify(result)}`);
    })
    .catch((err) => {
      console.error(`Error occurred while sending a message to Kafka: ${err}`);
    });
}

module.exports = runKafka;
