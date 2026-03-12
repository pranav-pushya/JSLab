/**
 * JSLab — EXAM QUESTION BANK (ST1 Pattern)
 * 50+ new questions exactly matching actual Chitkara University ST1 exam pattern.
 * Author: Pranav Pushya
 */
const EXAM_QUESTIONS = [
  // --- typeof Operator (5 questions) ---
  {
    id: "q_typeof_1",
    question: "What will be the output of the following code?",
    code: "`console.log(typeof 29.9);`",
    options: ["float", "number", "integer", "double"],
    correct: 1,
    explanation: "JavaScript has no separate float or integer types. All numbers are implemented as double-precision 64-bit floating-point format (IEEE 754), so the typeof is simply 'number'.",
    marks: 1,
    topic: "Data Types",
    lecture: 1
  },
  {
    id: "q_typeof_2",
    question: "What will be the output?",
    code: "`console.log(typeof null);`",
    options: ["null", "undefined", "object", "string"],
    correct: 2,
    explanation: "This is a known bug in JavaScript since its inception. typeof null perfectly returns 'object' instead of 'null'.",
    marks: 1,
    topic: "Data Types",
    lecture: 1
  },
  {
    id: "q_typeof_3",
    question: "What will be the output?",
    code: "`console.log(typeof ([]));`",
    options: ["array", "object", "undefined", "list"],
    correct: 1,
    explanation: "Arrays in JavaScript are fundamentally objects under the hood. Therefore, typeof returns 'object'. Use Array.isArray() to specifically test for arrays.",
    marks: 1,
    topic: "Data Types",
    lecture: 1
  },
  {
    id: "q_typeof_4",
    question: "What will be the output?",
    code: "`console.log(typeof typeof 1);`",
    options: ["number", "string", "object", "undefined"],
    correct: 1,
    explanation: "typeof 1 returns the string 'number'. Then typeof 'number' is 'string'.",
    marks: 1,
    topic: "Data Types",
    lecture: 1
  },
  {
    id: "q_typeof_5",
    question: "What does typeof undeclaredVariable return?",
    options: ["Throws an error", "null", "undefined", "NaN"],
    correct: 2,
    explanation: "Using typeof on an undeclared variable is perfectly safe (it does not throw a ReferenceError) and it returns the string 'undefined'.",
    marks: 1,
    topic: "Data Types",
    lecture: 1
  },

  // --- var/let/const scope and hoisting (8 questions) ---
  {
    id: "q_scope_1",
    question: "How can a datatype be declared constant in JS?",
    options: ["constant", "const", "final", "static"],
    correct: 1,
    explanation: "The 'const' keyword is used to declare variables whose value (or reference) cannot be reassigned.",
    marks: 1,
    topic: "Variables",
    lecture: 2
  },
  {
    id: "q_scope_2",
    question: "What will be the output?",
    code: "`console.log(x);\nvar x = 5;`",
    options: ["5", "undefined", "ReferenceError", "NaN"],
    correct: 1,
    explanation: "With 'var', the variable declaration is hoisted to the top, but the initialization remains in place. So x is known, but its value is 'undefined' at the time of logging.",
    marks: 1,
    topic: "Hoisting",
    lecture: 3
  },
  {
    id: "q_scope_3",
    question: "What will be the output?",
    code: "`console.log(y);\nlet y = 10;`",
    options: ["10", "undefined", "ReferenceError", "NaN"],
    correct: 2,
    explanation: "Variables declared with 'let' and 'const' are hoisted but remain in the Temporal Dead Zone (TDZ) until execution reaches the line where they are declared. Accessing them early throws a ReferenceError.",
    marks: 1,
    topic: "Hoisting",
    lecture: 3
  },
  {
    id: "q_scope_4",
    question: "What will be the output?",
    code: "`var a = 1;\nif (true) {\n  var a = 2;\n}\nconsole.log(a);`",
    options: ["1", "2", "undefined", "ReferenceError"],
    correct: 1,
    explanation: "'var' has function scope, not block scope. The 'if' block doesn't create a new scope for 'var', so 'var a = 2' overrides the global 'a'.",
    marks: 2,
    topic: "Scope",
    lecture: 4
  },
  {
    id: "q_scope_5",
    question: "What will be the output?",
    code: "`let b = 1;\nif (true) {\n  let b = 2;\n}\nconsole.log(b);`",
    options: ["1", "2", "undefined", "ReferenceError"],
    correct: 0,
    explanation: "'let' has block scope. The 'b' inside the 'if' block is completely separate from the 'b' outside of it.",
    marks: 2,
    topic: "Scope",
    lecture: 4
  },
  {
    id: "q_scope_6",
    question: "What will be the output?",
    code: "`for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 1);\n}`",
    options: ["0 1 2", "3 3 3", "undefined undefined undefined", "Throws error"],
    correct: 1,
    explanation: "Because 'var' is function-scoped (or global here), the loop completes and 'i' becomes 3 before any of the setTimeout callbacks execute. They all reference the same 'i', printing 3 three times.",
    marks: 2,
    topic: "Scope & Callbacks",
    lecture: 4
  },
  {
    id: "q_scope_7",
    question: "What will be the output?",
    code: "`for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 1);\n}`",
    options: ["0 1 2", "3 3 3", "undefined undefined undefined", "Throws error"],
    correct: 0,
    explanation: "Because 'let' is block-scoped, a new distinct 'i' is created for every iteration of the loop. Each setTimeout closure captures its own specific 'i'.",
    marks: 2,
    topic: "Scope & Callbacks",
    lecture: 4
  },
  {
    id: "q_scope_8",
    question: "Which keyword allows redeclaration of the same variable name in the same scope?",
    options: ["let", "const", "var", "None of these"],
    correct: 2,
    explanation: "Only 'var' permits redeclaring the exact same variable in the exact same scope without throwing a SyntaxError.",
    marks: 1,
    topic: "Variables",
    lecture: 2
  },

  // --- Closure behavior and output prediction (8 questions) ---
  {
    id: "q_closure_1",
    question: "What will be the output?",
    code: `(function(a){
  return (function(){
    console.log(a);
    a = 6;
  })()
})(21);`,
    options: ["6", "21", "undefined", "ReferenceError"],
    correct: 1,
    explanation: "The inner function has access to the outer function's variable 'a' (which is passed as 21). It logs the current value of 'a' (21) before changing it to 6.",
    marks: 1,
    topic: "Closures",
    lecture: 12
  },
  {
    id: "q_closure_2",
    question: "Analyze closures output:",
    code: `function outer() {
  let counter = 0;
  return function inner() { return ++counter; };
}
const fn1 = outer();
const fn2 = outer();
console.log(fn1());
console.log(fn1());
console.log(fn2());`,
    options: ["1 2 3", "1 1 1", "1 2 1", "0 1 0"],
    correct: 2,
    explanation: "Each call to outer() creates a completely new execution context. fn1 and fn2 have their own separate `counter` variables. fn1 increments its counter twice (returns 1, then 2). fn2 increments its independent counter once (returns 1).",
    marks: 2,
    topic: "Closures",
    lecture: 12
  },
  {
    id: "q_closure_3",
    question: "What is a closure in JavaScript?",
    options: ["A function executing in global context", "A function bundled with its lexical environment", "An IIFE closing the window", "A variable that cannot be modified"],
    correct: 1,
    explanation: "A closure is formed when a function is bundled together (enclosed) with references to its surrounding state (the lexical environment). It gives you access to an outer function's scope from an inner function.",
    marks: 1,
    topic: "Closures",
    lecture: 12
  },
  {
    id: "q_closure_4",
    question: "What will be the output?",
    code: `function add(x) {
  return function(y) {
    return x + y;
  };
}
var add5 = add(5);
console.log(add5(2));`,
    options: ["5", "2", "7", "undefined"],
    correct: 2,
    explanation: "add(5) returns a function that holds x=5 in its closure. Calling that returned function with 2 (y) returns 5 + 2 = 7.",
    marks: 1,
    topic: "Closures",
    lecture: 12
  },
  {
    id: "q_closure_5_fixed",
    question: "What will be the output?",
    code: `let f;
{
  let val = 10;
  f = function() {
    return val;
  }
}
console.log(f());`,
    options: ["undefined", "ReferenceError", "10", "null"],
    correct: 2,
    explanation: "Even though the block has finished executing, the function assigned to 'f' retains a closure over the block's lexical scope, allowing it to access 'val' (10).",
    marks: 1,
    topic: "Closures",
    lecture: 12
  },
  {
    id: "q_closure_6",
    question: "Closures allow for what powerful programming pattern in JavaScript?",
    options: ["Class inheritance", "Data privacy / Encapsulation", "Garbage collection", "Type coercion"],
    correct: 1,
    explanation: "Because an inner function can access variables of its enclosing function, those variables can be kept private, accessible only through the exported inner functions (like the Module pattern).",
    marks: 1,
    topic: "Closures",
    lecture: 12
  },
  {
    id: "q_closure_7",
    question: "What will be the output?",
    code: `var scope = "outer scope";
function checkscope() {
  var scope = "inner scope";
  return scope;
}
console.log(checkscope());`,
    options: ["outer scope", "inner scope", "undefined", "ReferenceError"],
    correct: 1,
    explanation: "The function creates its own local variable 'scope' which shadows the global one. It returns the local one.",
    marks: 2,
    topic: "Scope",
    lecture: 12
  },
  {
    id: "q_closure_8",
    question: "What will be the output?",
    code: `function make() {
  var name = 'Mozilla';
  function display() { console.log(name); }
  return display;
}
var myFunc = make();
myFunc();`,
    options: ["undefined", "ReferenceError", "Mozilla", "null"],
    correct: 2,
    explanation: "myFunc is a reference to the display function. It maintains access to its lexical environment (which includes 'name'), so it logs 'Mozilla'.",
    marks: 1,
    topic: "Closures",
    lecture: 12
  },

  // --- Loop type questions (5 questions) ---
  {
    id: "q_loop_1",
    question: "Which loop is guaranteed to execute at least once?",
    options: ["for loop", "while loop", "do while loop", "for...in loop"],
    correct: 2,
    explanation: "The do...while loop evaluates its condition at the end of the loop body, guaranteeing that the body executes at least once.",
    marks: 1,
    topic: "Loops",
    lecture: 7
  },
  {
    id: "q_loop_2",
    question: "State which statement is correct about this code:",
    code: `var arr=[0,1,2,3,4,5];
function printArray(a) {
  var len = a.length, i = 0;
  if (len == 0) console.log("Empty Array");
  else { do { console.log(a[i]); } while (++i < len); }
}
printArray(arr);`,
    options: ["Throws an error", "Prints only even numbers", "Prints the numbers in the array in order", "Infinite loop"],
    correct: 2,
    explanation: "The do-while loop starts at i=0. The condition `++i < len` increments `i` first, then checks. This perfectly iterates from 0 to 5 and prints all elements sequentially.",
    marks: 1,
    topic: "Loops",
    lecture: 7
  },
  {
    id: "q_loop_3",
    question: "What will be the output?",
    code: `let str = "";
for (let i = 0; i < 5; i++) {
  if (i === 3) break;
  str += i;
}
console.log(str);`,
    options: ["01234", "012", "0124", "undefined"],
    correct: 1,
    explanation: "The string accumulates 0, 1, and 2. When i becomes 3, the `break` statement completely terminates the loop.",
    marks: 1,
    topic: "Loops",
    lecture: 7
  },
  {
    id: "q_loop_4",
    question: "What will be the output?",
    code: `let sum = 0;
for (let i = 0; i < 4; i++) {
  if (i === 2) continue;
  sum += i;
}
console.log(sum);`,
    options: ["6", "4", "3", "0"],
    correct: 1,
    explanation: "i goes 0, 1, 3 (skips 2 because of continue). The sum is 0 + 1 + 3 = 4.",
    marks: 2,
    topic: "Loops",
    lecture: 7
  },
  {
    id: "q_loop_5",
    question: "Which statement is true about for...of loops?",
    options: ["They iterate over object keys only", "They are used to iterate over iterable objects (like Arrays, Strings)", "They cannot be used with break/continue", "They return values synchronously from APIs"],
    correct: 1,
    explanation: "for...of creates a loop iterating over iterable objects, including Arrays, Strings, Maps, Sets, etc. (But not plain objects natively).",
    marks: 1,
    topic: "Loops",
    lecture: 7
  },

  // --- Array method output (8 questions) ---
  {
    id: "q_array_1",
    question: "Which method creates a new array with all elements that pass the test implemented by the provided function?",
    options: ["map()", "filter()", "reduce()", "forEach()"],
    correct: 1,
    explanation: "The filter() method creates a shallow copy of a portion of a given array, filtered down to just the elements that pass the test implemented by the provided function.",
    marks: 1,
    topic: "Array Methods",
    lecture: 10
  },
  {
    id: "q_array_2",
    question: "Predict output of:\n`[1, 2, 3].map(x => x * 2)`",
    options: ["[1, 2, 3]", "6", "[2, 4, 6]", "undefined"],
    correct: 2,
    explanation: "map() creates a new array populated with the results of calling a provided function on every element in the calling array. 1*2=2, 2*2=4, 3*2=6.",
    marks: 1,
    topic: "Array Methods",
    lecture: 10
  },
  {
    id: "q_array_3",
    question: "What does the following code return?\n`[1, 2, 3, 4].reduce((acc, curr) => acc + curr, 0)`",
    options: ["[1, 2, 3, 4]", "10", "01234", "undefined"],
    correct: 1,
    explanation: "reduce() executes a user-supplied 'reducer' callback function on each element of the array, passing in the return value from the calculation on the preceding element. 0+1+2+3+4 = 10.",
    marks: 1,
    topic: "Array Methods",
    lecture: 10
  },
  {
    id: "q_array_4",
    question: "What is the outcome of using the `splice()` method?",
    options: ["It extracts a section of a string and returns it as a new string.", "It changes the contents of an array by removing or replacing existing elements and/or adding new elements in place.", "It joins two or more arrays and returns a new array.", "It returns a shallow copy of a portion of an array into a new array object."],
    correct: 1,
    explanation: "splice() is a mutative method that changes the contents of the original array by removing, replacing, or adding elements. (Contrast with slice() which is non-mutative).",
    marks: 1,
    topic: "Array Methods",
    lecture: 10
  },
  {
    id: "q_array_5",
    question: "What will be the output?",
    code: `const arr = [1, null, 2, undefined, 3];
const filtered = arr.filter(Boolean);
console.log(filtered);`,
    options: ["[1, 2, 3]", "[1, null, 2, undefined, 3]", "[false, false, false]", "Throws Type Error"],
    correct: 0,
    explanation: "Passing the `Boolean` constructor directly to filter() automatically removes all falsy values (like null, undefined, 0, '', NaN, false) from the array.",
    marks: 2,
    topic: "Array Methods",
    lecture: 10
  },
  {
    id: "q_array_6",
    question: "What will be the output?",
    code: `const a = [1, 2, 3];
const b = a.push(4);
console.log(b);`,
    options: ["[1, 2, 3, 4]", "4", "undefined", "[4]"],
    correct: 1,
    explanation: "The `push()` method does not return the mutated array. Instead, it returns the *new length* of the array, which is 4.",
    marks: 2,
    topic: "Array Methods",
    lecture: 10
  },
  {
    id: "q_array_7",
    question: "What will be the output?",
    code: `const arr = [10, 20, 30];
const res = arr.join('-');
console.log(typeof res);`,
    options: ["object", "array", "string", "number"],
    correct: 2,
    explanation: "The `join()` method creates and returns a new string by concatenating all of the elements in an array, separated by commas or a specified separator string.",
    marks: 1,
    topic: "Array Methods",
    lecture: 10
  },
  {
    id: "q_array_8",
    question: "How do you add elements to the BEGINNING of an array?",
    options: ["push()", "unshift()", "shift()", "pop()"],
    correct: 1,
    explanation: "unshift() adds one or more elements to the beginning of an array and returns the new length. shift() removes from the beginning. push() adds to the end.",
    marks: 1,
    topic: "Array Methods",
    lecture: 10
  },

  // --- Function behavior (6 questions) ---
  {
    id: "q_func_1",
    question: "Describe the purpose of the return statement in a function",
    options: ["It pauses the function execution", "It returns the value and stops executing the function", "It prints a value to the console", "It allows the function to call itself recursively"],
    correct: 1,
    explanation: "When a return statement is used in a function body, the execution of the function is stopped. If specified, a given value is returned to the function caller.",
    marks: 1,
    topic: "Functions",
    lecture: 11
  },
  {
    id: "q_func_2",
    question: "What is an IIFE?",
    options: ["Immediately Invoked Function Expression", "Internal Iteration For Elements", "Interpreted Inline Function Execution", "Interface Injection For Extensibility"],
    correct: 0,
    explanation: "An IIFE (Immediately Invoked Function Expression) is a JavaScript function that runs as soon as it is defined. Typical syntax: (function() { ... })();",
    marks: 1,
    topic: "Functions",
    lecture: 11
  },
  {
    id: "q_func_3",
    question: "What will be the output?",
    code: `function sum(a, b) {
  return;
  a + b;
}
console.log(sum(1, 2));`,
    options: ["3", "undefined", "NaN", "Throws SyntaxError"],
    correct: 1,
    explanation: "Due to Automatic Semicolon Insertion (ASI), a standalone 'return' on a line acts as `return;`, immediately terminating the function and returning undefined.",
    marks: 2,
    topic: "Functions",
    lecture: 11
  },
  {
    id: "q_func_4",
    question: "What is true about Arrow Functions?",
    options: ["They have their own 'this' binding", "They cannot be used as methods", "They do not have their own 'arguments' object", "They must always use the 'return' keyword"],
    correct: 2,
    explanation: "Arrow functions do not have their own bindings to `this` or `arguments`. They inherit these from the parent scope.",
    marks: 1,
    topic: "Arrow Functions",
    lecture: 11
  },
  {
    id: "q_func_5",
    question: "What will be the output?",
    code: `const foo = function bar() {
  return 12;
};
console.log(typeof bar);`,
    options: ["function", "undefined", "number", "ReferenceError"],
    correct: 1,
    explanation: "The name 'bar' is local to the function body (it's a Named Function Expression). It is not available in the outer scope, so typeof bar is 'undefined'.",
    marks: 2,
    topic: "Functions",
    lecture: 11
  },
  {
    id: "q_func_6",
    question: "What happens if you pass fewer arguments to a function than it expects?",
    options: ["It throws a ReferenceError", "The extra parameters are initialized to 'undefined'", "It throws a TypeError", "The function fails to execute entirely"],
    correct: 1,
    explanation: "In JavaScript, if you pass fewer arguments than declared, the missing ones automatically receive the value 'undefined'.",
    marks: 1,
    topic: "Functions",
    lecture: 11
  },

  // --- Ternary operator (5 questions) ---
  {
    id: "q_ternary_1",
    question: "What will be the output?",
    code: `function height() {
  var height = 123.56;
  var type = (height>=190) ? "tall" : "short";
  return type;
}
console.log(height());`,
    options: ["tall", "short", "error", "undefined"],
    correct: 1,
    explanation: "Since 123.56 is not greater than or equal to 190, the condition is false, returning the second expression: 'short'.",
    marks: 1,
    topic: "Operators",
    lecture: 5
  },
  {
    id: "q_ternary_2",
    question: "What is the output?",
    code: `let age = 15;
let result = (age >= 18) ? "Adult" : (age >= 13) ? "Teen" : "Child";
console.log(result);`,
    options: ["Adult", "Teen", "Child", "undefined"],
    correct: 1,
    explanation: "Nested ternary operators are evaluated correctly. 15>=18 is false, moving to the next: 15>=13 is true, so it returns 'Teen'.",
    marks: 2,
    topic: "Operators",
    lecture: 5
  },
  {
    id: "q_ternary_3",
    question: "Which of the following describes the conditional (ternary) operator?",
    options: ["It is the only JavaScript operator that takes three operands", "It acts as a replacement for the 'switch' statement", "It executes a function repeatedly", "It binds a 'this' context"],
    correct: 0,
    explanation: "The conditional operator is indeed the only JavaScript operator that takes three operands: a condition followed by a question mark (?), then an expression to execute if the condition is truthy followed by a colon (:), and finally the expression to execute if the condition is falsy.",
    marks: 1,
    topic: "Operators",
    lecture: 5
  },
  {
    id: "q_ternary_4",
    question: "What is the output?",
    code: `let val = 0 ? "True" : "False";`,
    options: ["True", "False", "undefined", "0"],
    correct: 1,
    explanation: "The mathematical number 0 is a falsy value in JavaScript. Therefore, the ternary resolves to the false branch.",
    marks: 1,
    topic: "Operators",
    lecture: 5
  },
  {
    id: "q_ternary_5",
    question: "What is the output?",
    code: `console.log(1 < 2 ? 3 < 4 ? "A" : "B" : "C");`,
    options: ["A", "B", "C", "Error"],
    correct: 0,
    explanation: "The first condition (1 < 2) is true, so we evaluate the first outcome: `3 < 4 ? 'A' : 'B'`. 3 < 4 is true, so 'A' is returned.",
    marks: 2,
    topic: "Operators",
    lecture: 5
  },

  // --- Object truthy/falsy and property access (5 questions) ---
  {
    id: "q_obj_1",
    question: "Which statement is true about objects in JavaScript?",
    options: ["Objects cannot hold functions", "Objects are unordered collections", "Objects can store key-value pairs", "Objects can't be nested"],
    correct: 2,
    explanation: "Objects are logical collections of key-value pairs (properties and methods).",
    marks: 1,
    topic: "Objects",
    lecture: 14
  },
  {
    id: "q_obj_2",
    question: "What will be the output?",
    code: `function output(object) {
  var place = object ? object.place : 'Italy';
  return 'clean:' + place;
}
console.log(output({place:'India'}));`,
    options: ["clean:Italy", "clean:India", "clean:undefined", "Throws Error"],
    correct: 1,
    explanation: "The object `{place: 'India'}` is passed in. Objects are truthy, so the condition `object ?` is true, resolving to `object.place` which is 'India'.",
    marks: 2,
    topic: "Objects",
    lecture: 14
  },
  {
    id: "q_obj_3",
    question: "Which of these values is completely 'truthy' in JavaScript?",
    options: ["0", "'' (Empty string)", "NaN", "{} (Empty object)"],
    correct: 3,
    explanation: "All objects (including empty objects {} and empty arrays []) are truthy in JavaScript. The other three options are falsy.",
    marks: 1,
    topic: "Data Types",
    lecture: 1
  },
  {
    id: "q_obj_4",
    question: "What is the output?",
    code: `const obj = { a: 1 };
console.log('a' in obj);`,
    options: ["1", "true", "false", "undefined"],
    correct: 1,
    explanation: "The `in` operator returns true if the specified property is in the specified object or its prototype chain.",
    marks: 1,
    topic: "Objects",
    lecture: 14
  },
  {
    id: "q_obj_5",
    question: "What is the output?",
    code: `const person = { name: "Alice" };
Object.freeze(person);
person.name = "Bob";
console.log(person.name);`,
    options: ["Alice", "Bob", "undefined", "Throws TypeError (in strict mode) or Alice (in loose mode)"],
    correct: 0,
    explanation: "Since the script is not strictly defined, property assignment fails silently. The property `name` remans 'Alice' because Object.freeze makes the object immutable.",
    marks: 2,
    topic: "Objects",
    lecture: 14
  },

  // --- Additional ST1 Pattern Questions (5 extra questions to hit exactly 51) ---
  {
    id: "q_extra_1",
    question: "If two values do not have same type, the ........ operator may still consider them equal",
    options: ["===", "==", "=", "None of above"],
    correct: 1,
    explanation: "The abstract equality operator (==) performs type coercion if the operands are of different types, potentially coercing them to match before comparison.",
    marks: 1,
    topic: "Operators",
    lecture: 5
  },
  {
    id: "q_extra_2",
    question: "What is the output?",
    code: "`console.log(3 + 4 + '5');`",
    options: ["345", "12", "75", "undefined"],
    correct: 2,
    explanation: "Evaluation goes from left to right. First, 3 + 4 evaluates to the number 7. Then, 7 + '5' encounters a string interpolation, converting 7 to string and resulting in '75'.",
    marks: 1,
    topic: "Operators",
    lecture: 5
  },
  {
    id: "q_extra_3",
    question: "What is the output?",
    code: "`console.log('5' - 3);`",
    options: ["53", "2", "NaN", "Error"],
    correct: 1,
    explanation: "The subtraction operator (-) only works on numbers. It coerces the string '5' into the number 5, resulting in 5 - 3 = 2.",
    marks: 1,
    topic: "Operators",
    lecture: 5
  },
  {
    id: "q_extra_4",
    question: "What is the output?",
    code: "`console.log(1 === '1');`",
    options: ["true", "false", "SyntaxError", "undefined"],
    correct: 1,
    explanation: "The strict equality operator (===) checks both value AND type. Since one is a number and the other is a string, they are not strictly equal.",
    marks: 1,
    topic: "Operators",
    lecture: 5
  },
  {
    id: "q_extra_5",
    question: "Which of the following is NOT a JavaScript framework/library?",
    options: ["React", "Vue", "Angular", "Django"],
    correct: 3,
    explanation: "Django is a Python-based web framework. The rest are JavaScript libraries/frameworks.",
    marks: 1,
    topic: "Basics",
    lecture: 1
  }
];
