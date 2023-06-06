# Cloud-Based-Microservices-System
### Programming Languages:

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

### Framework:

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)

### Cloud:

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)

### Tool:

![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
  
## 🤖 EKS (Kubernetes) System Logic & Diagram
- A namespace called "book-store"
<img width="899" alt="System Design" src="https://github.com/Joseph-ljx/Cloud-Based-Microservices-System/assets/92981525/6818ffe6-c0f9-4bcd-8190-8d1e8d3d7864">  

### EKS Configuration for number of replicas (deployment)
- 2 pod instances for Customer BFF.
- 2 pod instances for Customer service.
- 2 pod instances for Book BFF.
- 1 pod instance 2 pod instances for Book service.
- 1 pod instance for CRM

### Deployment and Services
- Load balancer services: link corresponding pods of deployment.
- Deployment: Obtained latest version of Docker images from Dockerhub, run and operate as background program... 

### Health Monitoring
- A liveness probe as an http endpoint: GET /status that responds with a plain text message saying “OK”. (Plain text message means the response should have Content-Type: text/plain) of all REST services with same end point.

## ✈️ AWS VPC & Deployment
<img width="904" alt="AWS VPC design" src="https://github.com/Joseph-ljx/Cloud-Based-Microservices-System/assets/92981525/e9cfc02d-87d6-4de2-8f62-362232020ea0">

## :hammer_and_wrench: API Endpoints
There are over **30+** enpoints of Http request handling (please refer to the code for detail) :
- Http Method: GET, POST, PUT, DELETE
- Handling of the requests will depend on over **20+** services requirements.
- Response mainly included (here I will only list the most important http response code for main functionalities)
  - 200: Success.
  - 201: Successful creation.
  - 204: Success with empty response body.
  - 400: Illegal request.
  - 404: Does not exist.
  - 422: Already exist in the database.
  - 500: Internal server error.
  - 503: Server unavailable.
  - 504: Gateway time out.
  - ...

### Main endpoint functions:
- Adding a new book/customer to the system based on formatted structure of data, handling exceptions like already exist, illegal, missing, or malformed input, etc.
- Updating a book/customer inside the system, handling exceptions like not founded, illegal, missing, or malformed input, etc.
- Retrieving a book/customer information, handling exceptions like NULL return, does not exist, illegal, missing, or malformed input. Handling requests from both email search or user ID search.
- Provide health checks (health check endpoints) for both AWS EC2 instances and EKS Kubernetes pods.
- Provide relevent/related books search for a given book ISBN or name (recommendation system). Handling problems like no recommendation books founded, external service time out, internal server break down, etc. Formatted the results.
- JWT token information verification.
- Formatted return results according to different customer needs & endpoints.
- ...

## :rocket: Implementations
### Circuit Breaker:

- The call to the external service shall not significantly delay the response to the (hypothetical) end user.
- Thus, the Book service shall get a response from the recommendation engine within 3 seconds of the request being sent (timeout can be set when making an http call using Axios).
- The circuit to the open state upon the first call that times out.
  - For that first call that times out, your service should respond with error 504.
  - When the circuit is open the service should automatically return error 503 right away to any requests within 60 seconds of opening the circuit.
- The first request that arrives at the Book service after 60 seconds elapsed since the circuit was open will be different:
  - Service should try to reach the external service.
  - If it responds within 3 seconds, then you move the circuit back to the closed state, and your service’s response code is 200.
  - If it does not respond within 3 seconds, the service’s response code is 503, the circuit remains open, and start another 60-second window until the next attempt.

<img width="800" align="center" alt="Circuit Breaker" src="https://github.com/Joseph-ljx/Cloud-Based-Microservices-System/assets/92981525/2b38e1ce-584b-4a27-af75-4c66d3ed6372"><br>

### K8S volume:
- A directory, possibly with some data in it, which is accessible to the containers in a pod (mounted by the Book service pod). 
- Used emptyDir type to store the circuit breaker state.

### Kafka:
- Asynchronous services and data pipline.
- If a request to create a customer is valid, the Customer service (kafka producer) sends a message to a topic on Kafka. The message is in JSON format and contain the same attributes used in the REST service response. 
- Another asynchronous service (CRM in the runtime architecture diagram) is implemented. It is a Kafka consumer that shall connect to the Kafka topic mentioned above. 
- Upon receiving the message, the CRM service (also dockerized and deployed to the EKS cluster using the same mechanisms used for the REST services with only 1 replica) parses the content and send an email to the newly registered customer. 
- I use Amazon SES API and also (Nodemailer + Gmail app authorization) to send the email.

<img width="920" alt="Screenshot 2023-06-06 at 17 18 40" src="https://github.com/Joseph-ljx/Cloud-Based-Microservices-System/assets/92981525/93edc0f1-1003-4c5f-ae33-d9b1ab7433bf">

### BFF (Backend For Frontend) Services:

This will arouse the services to handle the request and response from client differently:
- Single Responsibility Principle.
- Process (Preprocess) the API request and forward to the service endpoints.
- Formatted the response results transmitted from the service endpoints, performing post data prume.

The capability of the BFF will grow over time.
- Identify the type of client making the request (desktop or mobile) and configure the response accordingly. The HTTP request to the BFF services contains the "user-agent" header, which specifies the client device (mobile or desktop).
- Each BFF is associated with 1 or more services.
- Each BFF is going to verify the corresponding JWT token for each API calling.

### JWT Token (Middleware verification):
- All requests to the BFF services will contain a valid JWT token (encoded with the HS256 algorithm).
- Ensure the security for stateless, cross-domain microservices authorization.
- Process and obtained a valid JWT tokwn by outsource tools.
- The BFF will verify the JWT Token:
  - Correct format.
  - Correct information.
  - In necessary conditions (timestamps, volume...). 

<img width="1611" alt="JWT" src="https://github.com/Joseph-ljx/Cloud-Based-Microservices-System/assets/92981525/45a7b373-3a02-4079-82e6-c218f63d1022">

##  :floppy_disk: Databases
### MySQL (workbench, command clint)
  - Local connection.
  - Local testing (development environment)
  - SQL script test

### AWS RDS (DB enginer contains MariaDB, PostgreSQL, MySQL...).
  - Load balancer: balancing load for different replicas for scalability, high performance, high availability, fault tolerance, etc. 
  - Security groups: controlling access
  - Subnets: secure acess control. 
  - EC2 entities: exploit instances for connection, status control, SQL execution. 
  - Master-slave (read-write) mechanisms: adopt write replica as the main replica, ensure high availability and scalability. 
  - ...

### PuTTY & Linux
  - Distributed System Control.
  - EC2 instances management.
  - Scripts execution.

### Test Data:
- over 200 tuples of mock testing data entries
- ETL simulation


