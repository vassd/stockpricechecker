<a name="readme-top"></a>
# The Stock Price Checker App

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#running">Running</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<a name="about-the-project"></a>

An application to check stock prices. 

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

<a name="built-with"></a>

* **Programming language:** TypeScript
* **Framework:** NestJS
* **VCS:** Git
* **Package Manager:** pnpm
* **Database:** PostgreSQL
* **Containerization:** Docker
* **Communication:** REST API
* **Linters:** Eslint, Prettier
* **Testing:** Jest
* **Open API:** Swagger
* **CI/CD Tool:** GitHub Actions

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

<a name="getting-started"></a>

## Prerequisites

<a name="prerequisites"></a>

* Node [18](https://nodejs.org/en/download/package-manager)
* Docker

## Installation

<a name="installation"></a>
1. Install pnpm
```sh
npm install -g pnpm
```
2. Install the packages
```sh
pnpm install
```
3. Build docker image using dockerfile
```sh
docker build -t stock-price-checker .
```
# Full Run
1. Run docker-compose start up services
```sh
docker-compose.yml -p stockpricechecker up -d
```

## Running

<a name="running"></a>

After the application starts you can call the API endpoints based on this [swagger documentation](http://localhost:3000/api).

To check what is available in the database check [adminer](http://localhost:8080).
For adminer you can use these credentials to login:
* **System:** PostgreSQL
* **Server:** postgres
* **Username:** test
* **Password:** pass
* **Database:** mydb

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

<a name="contact"></a>

David Vass - [Linkedin](https://www.linkedin.com/in/d%C3%A1vid-vass-aa716b1b6/) - [email](mailto:nighturbex@protonmail.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
