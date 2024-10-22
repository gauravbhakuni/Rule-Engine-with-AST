import React, { useState } from 'react';

const App = () => {
    const [ruleId, setRuleId] = useState('');    // ID of the rule to fetch from MongoDB
    const [result, setResult] = useState('');    // Stores evaluation result (True/False)
    const [userData, setUserData] = useState({   // User data for evaluation
        age: '',
        department: '',
        salary: '',
        experience: ''
    });

    const [ruleName, setRuleName] = useState('');     // State for rule name
    const [ruleString, setRuleString] = useState(''); // State for rule string

    // Function to handle adding a new rule
    const handleAddRule = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/rules/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: ruleName, ruleString })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            alert('Rule added successfully!');
        } catch (error) {
            console.error('Error adding rule:', error);
        }
    };

    // Function to evaluate the rule against the given user data by fetching the rule (AST) from MongoDB
    const handleEvaluateRule = async () => {
        try {
            // Step 1: Fetch the rule (AST) from MongoDB using ruleId
            const ruleResponse = await fetch(`http://localhost:5000/api/rules/${ruleId}`);
            if (!ruleResponse.ok) {
                throw new Error(`Error: ${ruleResponse.status} ${ruleResponse.statusText}`);
            }
            const { ast } = await ruleResponse.json(); // Assuming response contains an `ast` object
            console.log('Fetched AST:', ast);

            // Step 2: Send userData and AST for evaluation
            const response = await fetch('http://localhost:5000/api/rules/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ast, userData })  // Send AST and userData for evaluation
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data.result ? 'True' : 'False');  // Update the result state
            console.log('Evaluation result:', data);
        } catch (error) {
            console.error('Error in evaluation:', error);
        }
    };

    // Function to handle input changes for user data fields
    const handleUserDataChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    return (
        <div className="App">
            <h1>Rule Engine</h1>

            {/* Input for adding a new rule (AST) */}
            <div>
                <h2>Add New Rule</h2>
                <input
                    type="text"
                    placeholder="Rule Name"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                />
                <textarea
                    placeholder="Enter rule string"
                    value={ruleString}
                    onChange={(e) => setRuleString(e.target.value)}
                />
                <button onClick={handleAddRule}>Add Rule</button>
            </div>

            {/* Inputs for user data (age, department, salary, experience) */}
            <div>
                <h2>Evaluate Rule</h2>
                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={userData.age}
                    onChange={handleUserDataChange}
                />
                <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={userData.department}
                    onChange={handleUserDataChange}
                />
                <input
                    type="number"
                    name="salary"
                    placeholder="Salary"
                    value={userData.salary}
                    onChange={handleUserDataChange}
                />
                <input
                    type="number"
                    name="experience"
                    placeholder="Experience"
                    value={userData.experience}
                    onChange={handleUserDataChange}
                />

                {/* Input for fetching rule by ID */}
                <div>
                    <input
                        type="text"
                        placeholder="Rule ID"
                        value={ruleId}
                        onChange={(e) => setRuleId(e.target.value)}
                    />
                    <button onClick={handleEvaluateRule}>Evaluate Rule</button>
                </div>

                {/* Show evaluation result */}
                <p>Result: {result}</p>
            </div>
        </div>
    );
};

export default App;
