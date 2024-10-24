# Rule Engine with AST

This project implements a rule engine that allows users to create, evaluate, and manage rules based on user-defined criteria. The rules are represented as abstract syntax trees (ASTs) for easy evaluation and manipulation.

## Features

- **Add New Rule**: Users can create new rules by providing a rule name and a rule string, which is parsed into an AST.
- **Evaluate Rule**: Users can evaluate a rule against provided user data (age, department, salary, experience) to get a True or False result.
- **User-Friendly Interface**: The application provides a simple and intuitive interface for rule management.

## Technologies Used

- **React**: For building the user interface.
- **Node.js**: For the backend server.
- **Express**: For handling API requests.
- **MongoDB**: For storing rules and user data.
- **Custom AST Parser**: For parsing rule strings into abstract syntax trees.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/gauravbhakuni/Rule-Engine-with-AST.git
    ```
    
2. Install backend dependencies:

    ```bash
    cd rule-engine
    npm install
    ```

3. Install frontend dependencies:

    ```bash
    cd rule-engine-ui
    npm install
    ```

4. Run the backend server:

    ```bash
    cd rule-engine
    node app.js
    ```

5. Run the frontend application in a new terminal:

    ```bash
    cd rule-engine-ui
    npm start
    ```

## Usage

1. Open the app in a web browser.
2. To create a new rule, enter the rule name and rule string, then click "Add Rule".
3. To evaluate a rule, enter the rule ID to fetch and evaluate the rule against user data (age, department, salary, experience).
4. The evaluation result will be displayed as True or False.

## API Integration

The project includes the following API endpoints:

- **POST /api/rules/create**: Create a new rule.
- **GET /api/rules/:id**: Fetch a rule by ID.
- **POST /api/rules/evaluate**: Evaluate a rule against user data.

## Contributing

1. Fork the repository.
2. Create a new branch:

    ```bash
    git checkout -b feature-branch
    ```

3. Make your changes and commit them:

    ```bash
    git commit -m "Add some feature"
    ```

4. Push to the branch:

    ```bash
    git push origin feature-branch
    ```

5. Submit a pull request.
