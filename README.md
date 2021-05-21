# Code Engine Scalable APIs

Demo for the Call for Code Code Engine hackathon. This example provides two REST endpoints for HTTP POST and GET methods that are mapped to corresponding create-cat and fetch-cat IBM Code Engine applications representing a RESTful API for a web or mobile backend.

![Scalable APIs](img/scalable-apis.png)

By packaging each method independently, each method can scale independently. For example, an API is likely to receive many more requests to its `GET` method than its `DELETE` method. This sample shows `GET` and `POST` methods supported by a simple Node.js HTTP server.

## Benefits of scalable APIs

![Scalable APIs](img/game.gif)

## Benefits of scalable methods

![Scalable APIs](img/conference.gif)

## Getting started

> Note: The Code Engine command line has shorthand for commands and parameter flags. This tutorial spells them out using the longer form for better readability. For example `application` vs `app` and `--name` vs `-n`.

1. [Set up Code Engine environment](#1-set-up-code-engine-environment)
2. [Create Code Engine apps](#2-create-code-engine-apps)
3. [Invoke the REST endpoints](#3-invoke-the-rest-endpoints)
4. [View usage](#4-view-usage)
5. [Clean up](#5-clean-up)

## 1. Set up Code Engine environment

### Install or update your command line tools

> Note: We won't use the [IBM Cloud Shell](https://cloud.ibm.com/shell) service for this demo, as it doesn't include the Docker tool needed to build our images.

Download and install the following tools and plugins:

- [IBM Cloud command line (`ibmcloud`)](https://cloud.ibm.com/docs/cli/reference/ibmcloud?topic=cloud-cli-getting-started)
- [Code Engine plugin (`ce`)](https://cloud.ibm.com/codeengine/cli)
- [Cloud Object Storage plugin (`cos`)](https://cloud.ibm.com/docs/cloud-object-storage-cli-plugin)
  for samples which use IBM Cloud Object Storage
- [`docker`](https://docker.io/) if you choose to build the images yourself.
  For novices, skip this.

If you installed those tools before, please ensure you have the latest versions of each plugin:

```bash
ibmcloud plugin update --all --force
```

### Clone this repository

This repository has the source code for the applications we're going to deploy.

```bash
git clone https://github.com/krook/code-engine-scalable-apis
```

### Set up an IBM Cloud resource group and project

```bash
# Log in with your standard account if not using the Cloud Shell, can't be a Lite account
ibmcloud login
export DOCKERHUB_USERNAME=[YOUR DOCKERHUB USERNAME]
export DOCKERHUB_PASSWORD=[YOUR DOCKERHUB PASSWORD]

# Create a resource group for your projects, or reuse an existing one
ibmcloud resource group-create call-for-code
ibmcloud target -g call-for-code

# Create a project for your applications, and a registry entry for the place to store images
ibmcloud ce project create --name scalable-apis
ibmcloud ce registry create --name dockerhub \
         --server https://index.docker.io/v1/
         --username $DOCKERHUB_USERNAME \
         --password $DOCKERHUB_PASSWORD
ibmcloud ce project select --name scalable-apis
```

## 2. Create a backing data store with Cloudant

````
# Grab region
export REGION=$(ibmcloud target | awk '/Region:/{ print $2 }')

# Create an instance of Cloudant, if you don't have one
ibmcloud resource service-instance-create cats-database \
         cloudantnosqldb lite $REGION
``

## 2. Create Code Engine apps

### Create an action to create a cat entity

```bash
# Change to the post-cat directory
cd code-engine-scalable-apis/post-cat

# Build the image. Make sure the Docker daemon is running.
docker build --no-cache -t $DOCKERHUB_USERNAME/post-cat .

# And push it
docker push $DOCKERHUB_USERNAME/post-cat

# Create the app
ibmcloud ce application create --name post-cat --image $DOCKERHUB_USERNAME/post-cat

# Bind the Cloudant service credentials to the app
ibmcloud ce application bind --name post-cat --service-instance cats-database

# Get the URL of the app for later use
POST_URL=$(ibmcloud ce application get --name post-cat --output url)
````

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

# Bind the Cloudant service credentials to the app
ibmcloud ce application bind --name post-cat --service-instance cats-database

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

## 4. View usage

## 5. Clean up

### Remove the applications

```bash
# Delete apps
ibmcloud ce application delete --name get-cat --force
ibmcloud ce application delete --name post-cat --force
ibmcloud ce project delete --name scalable-apis --force

# Delete database
ibmcloud resource service-instance-delete cats-database
```

## License

[Apache 2.0](LICENSE)
