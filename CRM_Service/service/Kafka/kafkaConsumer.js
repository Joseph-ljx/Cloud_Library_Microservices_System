/**
 * Construct Kafka consumer
 */

const { Kafka } = require("kafkajs");
const brokers = ["44.214.218.139:9092", "44.214.213.141:9092"];
const topic = "jianxian.customer.evt";

// Create the kafka:

const kafka = new Kafka({
  clientId: "jianxian-app",
  brokers: brokers,
});

// Create the consumer:

const consumer = kafka.consumer({ groupId: "jianxian-group" });

// Get the AWS-SES for sending the message:
// Should use the verified mail one.

const transporter = require("../nodeMailer/GmailSender");

/**
 * Listening to Kafka messages.
 */

const kafkaConsumer = async () => {
  // Connect the consumer:
  await consumer.connect();

  // Subscribe the according topic
  await consumer.subscribe({ topic: topic, fromBeginning: true });

  // Monitor each message:
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Obtain the JSON data for each message:
      const data = JSON.parse(message.value.toString());

      // Create params for sending the message
      // const params = {
      //   Destination: {
      //     // userId: email
      //     ToAddresses: [data.userId],
      //   },
      //   Message: {
      //     Body: {
      //       Text: {
      //         Data:
      //           "Dear" +
      //           data.name +
      //           "Welcome to the Book store created by jianxian. Exceptionally this time we won’t ask you to click a link to activate your account.",
      //       },
      //     },
      //     // Subject is fixed (must be).
      //     Subject: {
      //       Data: "Activate your book store account",
      //     },
      //   },
      //   // Verified source email...
      //   Source: "jianxian2023@gmail.com",
      // };

      // create a message object
      const gMessage = {
        from: "jianxian2023@gmail.com",
        to: data.userId,
        subject: "Activate your book store account",
        text:
          "Dear " +
          data.name +
          ". Welcome to the Book store created by jianxian. Exceptionally this time we won’t ask you to click a link to activate your account.",
      };

      console.log(gMessage);

      // send the message using the transporter object
      transporter.sendMail(gMessage, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`Message sent: ${info.messageId}`);
        }
      });
    },
  });
};

module.exports = kafkaConsumer;
