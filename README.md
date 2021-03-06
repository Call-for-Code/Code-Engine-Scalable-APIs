# Code Engine Scalable APIs

Demo for the Call for Code Code Engine hackathon. This example provides two REST endpoints for HTTP POST and GET methods that are mapped to corresponding `post-cat` and `get-cat` IBM Code Engine applications representing a RESTful API for a web or mobile backend that implements the architecture below.

By packaging each method independently, each method can scale on its own. For example, an API is likely to receive many more requests to its `GET` method than its `DELETE` method. This sample shows `GET` and `POST` methods supported by a simple Node.js HTTP server that uses a Cloudant package to connect to a bound database.

![Scalable APIs](img/scalable-apis.png)

## Benefits of scalable APIs

![Scalable APIs](img/game.gif)

## Benefits of scalable methods

![Scalable APIs](img/conference.gif)

## Getting started

> Note: The Code Engine command line has shorthand for commands and parameter flags. This tutorial spells them out using the longer form for better readability. For example `application` vs `app` and `--name` vs `-n`.

1. [Set up Code Engine environment](#1-set-up-code-engine-environment)
2. [Create Code Engine apps](#2-create-code-engine-apps)
3. [Invoke the REST endpoints](#3-invoke-the-rest-endpoints)
4. [View logs](#4-view-logs)
5. [Clean up](#5-clean-up)
6. [Learn more](#6-learn-more)

## 1. Set up Code Engine environment

### Install or update your command line tools

> Note: We won't use the [IBM Cloud Shell](https://cloud.ibm.com/shell) service for this demo, as it doesn't include the Docker tool needed to build our images.

Download and install the following tools and plugins:

- [IBM Cloud command line (`ibmcloud`)](https://cloud.ibm.com/docs/cli/reference/ibmcloud?topic=cloud-cli-getting-started)
- [Code Engine plugin (`ce`)](https://cloud.ibm.com/codeengine/cli)
- [`docker`](https://docker.io/) for building images as well as pushing them to a Docker Hub namespace.

If you installed the Code Engine plugin before, please make you have the latest versions:

```bash
ibmcloud plugin update --all --force
```

### Clone this repository

This repository has the source code for the applications we're going to deploy.

```bash
git clone https://github.com/Call-for-Code/Code-Engine-Scalable-APIs
cd Code-Engine-Scalable-APIs
```

### Set up an IBM Cloud resource group and project

```bash
# Log in with your standard account, can't be a Lite account
ibmcloud login
export DOCKERHUB_USERNAME=[YOUR DOCKERHUB USERNAME]
export DOCKERHUB_PASSWORD=[YOUR DOCKERHUB PASSWORD]

# Create a resource group for your projects, or reuse an existing one
ibmcloud resource group-create call-for-code
ibmcloud target -g call-for-code

# Create a project for your applications, and a registry entry for the place to store images
ibmcloud ce project create --name scalable-apis
ibmcloud ce registry create \
         --name dockerhub \
         --server https://index.docker.io/v1/ \
         --username $DOCKERHUB_USERNAME \
         --password $DOCKERHUB_PASSWORD
ibmcloud ce project select --name scalable-apis
```

### Create a backing data store with Cloudant

```bash
# Create an instance of Cloudant, if you don't have one
# Set the region to something other than `us-south` if needed
ibmcloud resource service-instance-create cats-database \
         cloudantnosqldb lite us-south \
         --parameters '{"legacyCredentials": false}'

# Confirm that the project and service are up
ibmcloud resource service-instances
```

## 2. Create Code Engine apps

### Create an action to create a cat entity

```bash
# Change to the post-cat directory
cd post-cat

# Build the image. Make sure the Docker daemon is running.
docker build --no-cache -t $DOCKERHUB_USERNAME/post-cat .

# And push it
docker push $DOCKERHUB_USERNAME/post-cat

# Create the app
ibmcloud ce application create --name post-cat --image $DOCKERHUB_USERNAME/post-cat

# Get app details, if needed
ibmcloud ce application get --name post-cat

# Bind the Cloudant service credentials to the app
ibmcloud ce application bind --name post-cat --service-instance cats-database

# Get the URL of the app for later use
POST_URL=$(ibmcloud ce application get --name post-cat --output url)
```

### Create an action to retrieve a cat entity

```bash
# Change to the get-cat directory
cd ../get-cat

# Build the image
docker build --no-cache -t $DOCKERHUB_USERNAME/get-cat .

# And push it
docker push $DOCKERHUB_USERNAME/get-cat

# Create the app
ibmcloud ce application create --name get-cat --image $DOCKERHUB_USERNAME/get-cat

# Get app details, if needed
ibmcloud ce application get --name get-cat

# Bind the Cloudant service credentials to the app
ibmcloud ce application bind --name get-cat --service-instance cats-database

# Get the URL of the app for later use
GET_URL=$(ibmcloud ce application get --name get-cat --output url)
```

## 3. Invoke the REST endpoints

Using `curl` we can now send HTTP requests to the REST APIs.

```bash
# POST /v1/cat {"name": "Tahoma", "color": "Tabby"}
curl -X POST -H 'Content-Type: application/json' \
             -d '{"name": "Tahoma", "color": "Tabby"}' $POST_URL

# GET /v1/cat?id=1
curl $GET_URL
```

## 4. View logs

You can now use a few other tools to view your applications that represent your independent REST endpoints.

You have two options:

- Continue to use the [command line](https://cloud.ibm.com/docs/codeengine?topic=codeengine-cli)
- Begin to use the [web user interface](https://cloud.ibm.com/codeengine/overview).

For a quick look at logs and events, use this command:

```bash
ibmcloud ce application logs --name post-cat --tail 10
ibmcloud ce application logs --name get-cat --tail 10
```

To dig into various parts of the application, including the logs:

![Logging](img/logging.png)

## 5. Clean up

### Remove the applications

```bash
# Delete apps
ibmcloud ce application delete --name get-cat --force
ibmcloud ce application delete --name post-cat --force
ibmcloud ce project delete --name scalable-apis --force --hard

# Delete database
ibmcloud resource service-instance-delete cats-database --force --recursive
```

## 6. Learn more

[Check out this repo of additional sample applications to explore other use cases](https://github.com/IBM/CodeEngine).

## License

[Apache 2.0](LICENSE)
