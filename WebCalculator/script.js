class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    // Clear all data
    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = false;
    }

    // Delete last entered digit
    delete() {
        if (this.shouldResetDisplay) return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    // Add number to current operand
    appendNumber(number) {
        // Reset display if needed (after calculation)
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }

        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    // Choose operation
    chooseOperation(operation) {
        // If current operand is empty, just change the operation
        if (this.currentOperand === '') {
            if (this.previousOperand !== '') {
                this.operation = operation;
                return;
            }
            return;
        }

        // If there's a previous operand and operation, compute first
        if (this.previousOperand !== '' && this.operation != null) {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    // Perform calculation
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Check for invalid numbers
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                // Handle division by zero
                if (current === 0) {
                    this.displayError('Cannot divide by zero');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle very large numbers
        if (!isFinite(computation)) {
            this.displayError('Result too large');
            return;
        }

        // Round to prevent floating point precision issues
        computation = Math.round((computation + Number.EPSILON) * 100000000) / 100000000;

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
    }

    // Display error message
    displayError(message) {
        this.currentOperand = message;
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = true;
    }

    // Format number for display
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    // Update display
    updateDisplay() {
        // Add flash animation
        this.currentOperandElement.parentElement.classList.add('display-update');
        setTimeout(() => {
            this.currentOperandElement.parentElement.classList.remove('display-update');
        }, 100);

        // Update current operand display
        if (this.currentOperand === '') {
            this.currentOperandElement.innerText = '0';
        } else if (typeof this.currentOperand === 'string' && isNaN(parseFloat(this.currentOperand))) {
            // Display error messages as-is
            this.currentOperandElement.innerText = this.currentOperand;
        } else {
            this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        }

        // Update previous operand display
        if (this.operation != null) {
            const operatorDisplay = this.operation === '*' ? '×' : this.operation;
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${operatorDisplay}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
}

// Initialize calculator
const calculator = new Calculator(
    document.getElementById('previousOperand'),
    document.getElementById('currentOperand')
);

// Button event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Number buttons
    document.querySelectorAll('[data-number]').forEach(button => {
        button.addEventListener('click', () => {
            calculator.appendNumber(button.dataset.number);
            calculator.updateDisplay();
        });
    });

    // Operator buttons
    document.querySelectorAll('[data-operator]').forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.dataset.operator);
            calculator.updateDisplay();
        });
    });

    // Action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', () => {
            switch (button.dataset.action) {
                case 'equals':
                    calculator.compute();
                    calculator.updateDisplay();
                    break;
                case 'clear':
                    calculator.clear();
                    calculator.updateDisplay();
                    break;
                case 'delete':
                    calculator.delete();
                    calculator.updateDisplay();
                    break;
                case 'decimal':
                    calculator.appendNumber('.');
                    calculator.updateDisplay();
                    break;
            }
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        // Prevent default behavior for calculator keys
        if (/[0-9+\-*/=.c\r\b]/.test(e.key.toLowerCase()) || e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
        }

        // Number keys
        if (/[0-9]/.test(e.key)) {
            calculator.appendNumber(e.key);
            calculator.updateDisplay();
        }

        // Operator keys
        if (['+', '-', '*', '/'].includes(e.key)) {
            calculator.chooseOperation(e.key);
            calculator.updateDisplay();
        }

        // Special keys
        switch (e.key) {
            case 'Enter':
            case '=':
                calculator.compute();
                calculator.updateDisplay();
                break;
            case 'Escape':
            case 'c':
            case 'C':
                calculator.clear();
                calculator.updateDisplay();
                break;
            case 'Backspace':
                calculator.delete();
                calculator.updateDisplay();
                break;
            case '.':
                calculator.appendNumber('.');
                calculator.updateDisplay();
                break;
        }
    });

    // Initial display update
    calculator.updateDisplay();

    // Add visual feedback for keyboard presses
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        let button = null;

        // Find corresponding button
        if (/[0-9]/.test(key)) {
            button = document.querySelector(`[data-number="${key}"]`);
        } else if (['+', '-', '*', '/'].includes(key)) {
            const operator = key === '*' ? '*' : key;
            button = document.querySelector(`[data-operator="${operator}"]`);
        } else if (key === 'Enter' || key === '=') {
            button = document.querySelector('[data-action="equals"]');
        } else if (key === 'Escape' || key.toLowerCase() === 'c') {
            button = document.querySelector('[data-action="clear"]');
        } else if (key === 'Backspace') {
            button = document.querySelector('[data-action="delete"]');
        } else if (key === '.') {
            button = document.querySelector('[data-action="decimal"]');
        }

        // Add visual feedback
        if (button) {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            setTimeout(() => {
                button.style.transform = '';
                button.style.boxShadow = '';
            }, 100);
        }
    });
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    calculator.updateDisplay();
});

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.style.transform = '';
            // Trigger click event
            button.click();
        });
    });
}
