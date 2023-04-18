// SpreadsheetFile.js
let SpreadsheetFile;
{
	function module(x, m) { return x < 0 ? x % m + m : x % m; }

	SpreadsheetFile = class {
		#array = new Array();
		#delimiter;
		#numberOfCols;
		#numberOfRows;

		static #_mime_types_ = new Map([
			[",", "text/csv"],
			["\t", "text/tsv"]
		]);

		static dsvString(array, delimiter = ",") { return array.map(row => row.join(delimiter)).join("\n"); }

		static dsvBlob(array, delimiter = ",") {
			const mime_type = this.#_mime_types_.get(delimiter) || "text/dsv";
			return new Blob([array.map(row => row.join(delimiter)).join("\n")], { type: mime_type });
		}

		static dsvFile(array, name = "", delimiter = ",") {
			const mime_type = this.#_mime_types_.get(delimiter) || "text/dsv";
			const file = new File([array.map(row => row.join(delimiter)).join("\n")], name, { type: mime_type });
			return file;
		}

		static async arrayFromDSVFile(file, delimiter = ",") { return (await file.text()).split("\n").map(row => row.split(delimiter)); }

		cell(rowNumber, colNumber) { return this.#array[rowNumber][colNumber]; }
		row(rowNumber) { return this.#array[rowNumber]; }
		col(colNumber) { return this.#array.map(row => row[colNumber]); }

		rows(rowStart, rowEnd) {
			if(!rowEnd) { return this.row(rowStart); }
			if(rowStart > rowEnd) { throw Error(`Invalid range\n\trowEnd: ${rowEnd}, rowStart: ${rowStart}`); }
			return this.#array.slice(rowStart, rowEnd + 1);
		}

		cols(colStart, colEnd) {
			if(!colEnd) { return this.col(colStart); }
			if(colStart > colEnd) { throw Error(`Invalid range\n\tcolEnd: ${colEnd}, colStart: ${colStart}`); }
			const cols = new Array(++colEnd - colStart).fill(undefined);
			cols.forEach((cur, idx, arr) => { arr[idx] = new Array(this.#numberOfRows).fill(undefined); });
			console.log(cols);
			this.#array.forEach((row, rowNumber) => {
				let rowSlice = row.slice(colStart, colEnd);
				cols.forEach((col, colNumber) => {
					col[rowNumber] = rowSlice[colNumber];
				});
			});
			// Delete the last element of each column if all are undefined
			for(let i = this.#numberOfRows - 1; i > -1 ; --i) {
				let found = true;
				for(let col of cols) { found &= col[i] !== undefined; }
				if(found) { break; }
				for(let col of cols) { col.pop(); }
			}
			return cols;
		}

		range(rowStart, colStart, rowEnd, colEnd) {
			if(rowEnd < rowStart || colEnd < colStart) {
				throw Error(`Invalid range\n\trowEnd: ${rowEnd}, rowStart: ${rowStart}\n\tcolEnd: ${colEnd}, colStart: ${colStart}`);
			}
			return this.#array.slice(rowStart, rowEnd + 1).map(row => row.slice(colStart, colEnd + 1));
		}

		get array() { return this.#array; }
		get delimiter() { return this.#delimiter; }
		get numberOfRows() { return this.#numberOfRows; }
		get numberOfCols() { return this.#numberOfCols; }

		constructor(file, delimiter = ",") {
			if(!(file instanceof File || file instanceof Blob)) { throw Error(`Error: ${file} is not a File nor a Blob!`); }
			this.#delimiter = delimiter;

			// await the file to be read to create the array
			this.ready = SpreadsheetFile.arrayFromDSVFile(file, delimiter).then(res => {
				this.#array = res;
				// freeze all the elements in the array
				Object.freeze(this.#array);
				this.#array.forEach(row => Object.freeze(row));

				// get the spreadsheet rows and columns
				this.#numberOfRows = res.length;
				this.#numberOfCols = res.reduce((acc, cur) => (cur.length > acc ? cur.length : acc), 0);
			});
		}
	}
}

// inheritance, prototype, extends, private variables and methods, getters and setters, constructor and factory functions
// extending multiple classes

// inheritance and Object.setPrototypeOf
/*
{
	// declaring objects
	const instance1 = {
		x: "original value",
		publicMethod1() {
			return "instance public method 1: " + this.x;
		}
	};

	const instance2 = {
		publicMethod2(x) {
			this.x = x;
		}
	}

	Object.setPrototypeOf(instance2, instance1);

	console.log(instance2.publicMethod1()); // original value
	instance2.publicMethod2("modified value");
	console.log(instance2.publicMethod1()); // original value

	// using factory functions
	function FactoryFunction1(x) {
		// const that = this;
		this.x = x;

		this.publicMethod1 = function() {
			return "fInstance public method 1: " + this.x;
		}
	}

	function FactoryFunction2() {
		this.publicMethod2 = function(x) {
			this.x = x;
		}
	}

	const fInstance = new FactoryFunction2();
	Object.setPrototypeOf(fInstance, new FactoryFunction1("original value"));

	console.log(fInstance.publicMethod1()); // original value
	fInstance.publicMethod2("modified value");
	console.log(fInstance.publicMethod1()); // original value

	// using classes
	class MyClass1 {
		publicMethod1() {
			return "cInstance public method 1: " +  this.x;
		}

		constructor(x) {
			this.x = x;
		}
	}

	class MyClass2 extends MyClass1 {
		publicMethod2(x) {
			this.x = x;
		}

		constructor(x) {
			super(x);
		}
	}

	const cInstance = new MyClass2("original value");

	console.log(cInstance.publicMethod1()); // original value
	cInstance.publicMethod2("modified value");
	console.log(cInstance.publicMethod1()); // modified value
}
*/

// closures and block scopes
/*
{
	// what is a closure
	{
		let someFunction = function() {
			let b = "value of b";

			// the returned function is a closure
			return function() {
				return a + ", " + b;
			};
		};

		function test() {
			try {
				console.log("Trying to get the value of \"a\"...");
				console.log(someFunction()());
				console.log("Value of \"a\" read successfully.");
			} catch(err) {
				console.log("Failed to get the value of \"a\".");
				// console.error(err);
			}
		}

		{
			// this block scope is not the parent scope of the closure returned by someFunction
			let a = "value of a";
			test(); // Failed to get the value of "a"
			// closures can only access the scope of where the outer function was defined (parent scope) at execution time (lexical environment)
		}

		let a = "value of a";
		test();
	}

	// immediatly invoked function vs. block scope to create function private variables
	{
		// block scopes control access
		let functionA;
		{
			let privateVariable = 0;
			functionA = function() { return x + ", " + ++privateVariable; };
		}

		let x = "value of x";
		console.log(functionA());

		// closures can access parent outer scope
		const functionB = (function() {
			let privateVariable = 0;
			return function() { return y + ", " + ++privateVariable; };
		})();

		let y = "value of y";
		console.log(functionB());
	}
}
*/

/*
// private static properties
{
	// example using factory functions
	{
		const FactoryFunction = (function() {
			// this can be considered a static private variable
			let staticPrivateVariable = 0;

			const privateMethod = function() {
				return "private method 1: " + this.x;
			}

			// constructor
			return function(x) {
				this.x = x;

				let privateVariable = "value of private variable";

				staticPrivateVariable++;
				FactoryFunction.staticVariable++;

				this.method = function() {
					return privateMethod.bind(this)() + " | " + privateVariable + " @ " + staticPrivateVariable;
				}
			};
		})();

		FactoryFunction.staticVariable = 0;

		const fInstance = new FactoryFunction("value of x");
		console.log(fInstance.method());
		console.log(FactoryFunction.staticVariable);
	}

	// example using classes and block scopes
	{
		let MyClass;
		{
			let staticPrivateVariable = 0;

			MyClass = class {
				static staticVariable = 0;

				constructor(x) {
					const privateMethod = (function() {
						return "private method 1: " + this.x;
					}).bind(this);

					this.x = x;

					let privateVariable = "value of private variable";

					staticPrivateVariable++;
					MyClass.staticVariable++;

					this.method = function() {
						return privateMethod() + " | " + privateVariable + " @ " + staticPrivateVariable;
					}
				}
			}
		}

		const cInstance = new MyClass("value of x");
		console.log(cInstance.method());
		console.log(MyClass.staticVariable);
	}

	// example using only classes
	{
		class MyClass {
			static staticVariable = 0;
			static #staticPrivateVariable = 0;
				
			#privateVariable;

			#privateMethod() {
				return "private method 1: " + this.x;
			}

			method() {
				return this.#privateMethod() + " | " + this.#privateVariable + " @ " + MyClass.#staticPrivateVariable;
			}

			constructor(x) {
				this.x = x;

				this.#privateVariable = "value of private variable"

				MyClass.#staticPrivateVariable++;
				MyClass.staticVariable++;
			}
		}

		const cInstance = new MyClass("value of x");
		console.log(cInstance.method());
		console.log(MyClass.staticVariable);
	}
}
*/

/*
// that vs bind
{
	// Motivation
	{
		function FactoryFunctionA(p) {
			// const that = this;

			this.property = p;

			function privateMethod() {
				return "Private method: " + this.property;
			}

			this.read = function() {
				return privateMethod();
			}

			this.write = function(x) {
				this.property = x;
			}
		}

		const fInstanceA = new FactoryFunctionA("property value");
		console.log(fInstanceA.read());
		fInstanceA.write("new property value");
		console.log(fInstanceA.read());

		function FactoryFunctionB(p) {
			const that = this;

			this.property = p;

			function privateMethod() {
				return "Private method: " + that.property;
			}

			this.read = function() {
				return privateMethod();
			}

			this.write = function(x) {
				that.property = x;
			}
		}

		const fInstanceB = new FactoryFunctionB("property value");
		console.log(fInstanceB.read());
		fInstanceB.write("new property value");
		console.log(fInstanceB.read());
	}

	// the problem of using that
	{
		function FactoryFunctionA(p) {
			const that = this;

			this.property = p;

			function privateMethod() {
				return "Private method: " + that.property;
			}

			this.methodA = function() {
				return privateMethod();
			}
		}

		function FactoryFunctionB() {
			const that = this;

			this.methodB = function(x) {
				that.property = x;
			};
		}

		const fInstance = new FactoryFunctionB();
		Object.setPrototypeOf(fInstance, new FactoryFunctionA("property value"));

		console.log(fInstance.methodA());
		fInstance.methodB("new property value");
		console.log(fInstance.methodA());
		// the problem is that "that" is pointing to the prototype of our object, preventing the methods to behave properly when inherited
		Object.getPrototypeOf(fInstance).property = "another property value";
		console.log(fInstance.methodA());
	}

	// a solution using bind
	{
		function FactoryFunctionA(p) {
			this.property = p;
	
			function privateMethod() {
				return "Private method: " + this.property;
			}
	
			this.methodA = function() {
				return privateMethod.bind(this)();
			}
		}
	
		function FactoryFunctionB() {	
			this.methodB = function(x) {
				this.property = x;
			};
		}
	
		const fInstance = new FactoryFunctionB();
		Object.setPrototypeOf(fInstance, new FactoryFunctionA("property value"));
	
		console.log(fInstance.methodA());
		fInstance.methodB("new property value");
		console.log(fInstance.methodA());
	}
}
*/

// serial experiments lain
/*
{
	function FactoryFunction1(x) {
		// public variable
		this.x = x;

		// private variable
		// const that = this;

		function privateMethod1() {
			// this.x cannot be used here
			return "private method 1: " + x;
		}

		function privateMethod2() {
			// one must set that in order to access object's public properties
			return "private method 2: " + this.x;
		}

		this.publicMethod1 = function() {
			return privateMethod1();
		}

		this.publicMethod2 = function() {
			return privateMethod2.bind(this)();
		}
	}

	FactoryFunction1.prototype.publicMethod3 = function(x) {
		this.x = x;
	}


	const instance1 = new FactoryFunction1("foo");
	const instance2 = new FactoryFunction1("bar");
	console.log(FactoryFunction1.prototype === instance1.__proto__);
	console.log(instance1 instanceof FactoryFunction1);

	console.log(instance1.publicMethod1());
	console.log(instance1.publicMethod2());
	instance1.publicMethod3("foobar");
	console.log(instance1.publicMethod1());
	console.log(instance1.publicMethod2());

	console.log(instance2.publicMethod1());
	console.log(instance2.publicMethod2());

	function FactoryFunction2(y) {
		// Object.setPrototypeOf(this, FactoryFunction1(x));
		this.y = y;
		// const that = this;

		this.publicMethod3 = function(x, y) {
			this.x = x;
			this.y = y;
		}

		this.publicMethod4 = function() {
			return this.publicMethod2() + ", public method 4: " + this.y;
			// return ", public method 4: " + that.y;
		}
	}

	// Object.setPrototypeOf(FactoryFunction1, FactoryFunction2);

	// const instance3 = new FactoryFunction2("baz");
	// Object.setPrototypeOf(instance3, instance1);
	// // instance3.publicMethod3("foobar", "foobaz");
	// console.log(instance3.publicMethod4());
}
*/

// composition and inheritance
// factory functions and Object.assign
/*
{
	function constructorA(a, b) {
		return {
			a: a,
			b: b,
			methodA() { return `method A: ${this.a}, ${this.b}.`; },
			methodC() { return `method C: ${this.a}`; }
		};
	}

	function constructorB(c) {
		return Object.assign(
			constructorA("hello", "world"),
			{
				c: c,
				methodB() { return `method B: ${this.a}, ${this.b}${this.c}.`; },
				methodC() { return `method C: ${this.c}`; }
			}
		);
	}

	let A = constructorA("hello", "world");
	let B = constructorB("!!!");
	console.log(A.methodA());
	console.log(A.methodC());
	console.log(B.methodA());
	console.log(B.methodB());
	console.log(B.methodC());
}
*/

/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
https://www.toptal.com/javascript/es6-class-chaos-keeps-js-developer-up#:~:text=Functions%20are%20first%2Dclass%20in,function%20that%20returns%20an%20object.
https://css-tricks.com/implementing-private-variables-in-javascript/
https://www.freecodecamp.org/news/scope-and-closures-in-javascript/
https://css-tricks.com/javascript-scope-closures/
https://medium.com/samsung-internet-dev/javascript-scope-and-closures-3666c4fdf2c2
https://codedamn.com/news/javascript/javascript-scope-and-closure-issues
https://en.wikipedia.org/wiki/Decorator_pattern

*/