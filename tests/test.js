var assert = require("assert"),
    parse = require("../");

var tests = [
	//tag names
	[
		"div",
		[
			[
				{
					"type": "tag",
					"name": "div"
				}
			]
		],
		"simple tag"
	],
	[
		"*",
		[
			[
				{
					"type": "universal"
				}
			]
		],
		"universal"
	],

	//traversal
	[
		"div div",
		[
			[
				{
					"type": "tag",
					"name": "div"
				},
				{
					"type": "descendant"
				},
				{
					"type": "tag",
					"name": "div"
				}
			]
		],
		"descendant"
	],
	[
		"div\t \n \tdiv",
		[
			[
				{
					"type": "tag",
					"name": "div"
				},
				{
					"type": "descendant"
				},
				{
					"type": "tag",
					"name": "div"
				}
			]
		],
		"descendant /w whitespace"
	],
	[
		"div + div",
		[
			[
				{
					"type": "tag",
					"name": "div"
				},
				{
					"type": "adjacent"
				},
				{
					"type": "tag",
					"name": "div"
				}
			]
		],
		"adjacent"
	],
	[
		"div ~ div",
		[
			[
				{
					"type": "tag",
					"name": "div"
				},
				{
					"type": "sibling"
				},
				{
					"type": "tag",
					"name": "div"
				}
			]
		],
		"sibling"
	],
	[
		"p < div",
		[
			[
				{
					"type": "tag",
					"name": "p"
				},
				{
					"type": "parent"
				},
				{
					"type": "tag",
					"name": "div"
				}
			]
		],
		"parent"
	],


	//Escaped whitespace
	[
		"#\\  > a ",
		[
			[
				{
					"type": "attribute",
					"action": "equals",
					"name": "id",
					"value": " ",
					"ignoreCase": false
				},
				{
					"type": "child"
				},
				{
					"type": "tag",
					"name": "a"
				}
			]
		],
		"Space between escaped space and combinator"
	],
	[
		".\\  ",
		[
			[
				{
					"type": "attribute",
					"name": "class",
					"action": "element",
					"value": " ",
					"ignoreCase": false
				}
			]
		],
		"Space after escaped space"
	],
	[
		"\\61 ",
		[
			[
				{
					"type": "tag",
					"name": "a"
				}
			]
		],
		"Numeric escape with space (BMP)"
	],
	[
		"\\1d306\\01d306",
		[
			[
				{
					"type": "tag",
					"name": "\uD834\uDF06\uD834\uDF06"
				}
			]
		],
		"Numeric escape (outside BMP)"
	],


	//attributes
	[
		"[name^=\"foo[\"]",
		[
			[
				{
					"type": "attribute",
					"name": "name",
					"action": "start",
					"value": "foo[",
					"ignoreCase": false
				}
			]
		],
		"quoted attribute"
	],
	[
		"[name^=\"foo[bar]\"]",
		[
			[
				{
					"type": "attribute",
					"name": "name",
					"action": "start",
					"value": "foo[bar]",
					"ignoreCase": false
				}
			]
		],
		"quoted attribute"
	],
	[
		"[name$=\"[bar]\"]",
		[
			[
				{
					"type": "attribute",
					"name": "name",
					"action": "end",
					"value": "[bar]",
					"ignoreCase": false
				}
			]
		],
		"quoted attribute"
	],
	[
		"[href *= \"google\"]",
		[
			[
				{
					"type": "attribute",
					"name": "href",
					"action": "any",
					"value": "google",
					"ignoreCase": false
				}
			]
		],
		"quoted attribute with spaces"
	],
	[
		"[value=\"\nsome text\n\"]",
		[
			[
				{
					"type": "attribute",
					"name": "value",
					"action": "equals",
					"value": "\nsome text\n",
					"ignoreCase": false
				}
			]
		],
		"quoted attribute with internal newline"
	],
	[
		"[name=foo\\.baz]",
		[
			[
				{
					"type": "attribute",
					"name": "name",
					"action": "equals",
					"value": "foo.baz",
					"ignoreCase": false
				}
			]
		],
		"attribute with escaped dot"
	],
	[
		"[name=foo\\[bar\\]]",
		[
			[
				{
					"type": "attribute",
					"name": "name",
					"action": "equals",
					"value": "foo[bar]",
					"ignoreCase": false
				}
			]
		],
		"attribute with escaped square brackets"
	],
	[
		"[xml\\:test]",
		[
			[
				{
					"type": "attribute",
					"name": "xml:test",
					"action": "exists",
					"value": "",
					"ignoreCase": false
				}
			]
		],
		"escaped attribute"
	],
	[
		"[name='foo ~ < > , bar' i]",
		[
			[
				{
					"type": "attribute",
					"name": "name",
					"action": "equals",
					"value": "foo ~ < > , bar",
					"ignoreCase": true
				}
			]
		],
		"attribute with previously normalized characters"
	],



	//pseudo selectors
	[
		":foo",
		[
			[
				{
					"type": "pseudo",
					"name": "foo",
					"data": null
				}
			]
		],
		"pseudo selector without any data"
	],
	[
		":bar(baz)",
		[
			[
				{
					"type": "pseudo",
					"name": "bar",
					"data": "baz"
				}
			]
		],
		"pseudo selector with data"
	],
	[
		":contains(\"(foo)\")",
		[
			[
				{
					"type": "pseudo",
					"name": "contains",
					"data": "(foo)"
				}
			]
		],
		"pseudo selector with data"
	],
	[
		":icontains('')",
		[
			[
				{
					"type": "pseudo",
					"name": "icontains",
					"data": ""
				}
			]
		],
		"pseudo selector with quote-stripped data"
	],
	[
		":contains(\"(foo)\")",
		[
			[
				{
					"type": "pseudo",
					"name": "contains",
					"data": "(foo)"
				}
			]
		],
		"pseudo selector with data"
	],

	//multiple selectors
	[
		"a , b",
		[
			[
				{
					"type": "tag",
					"name": "a"
				}
			],
			[
				{
					"type": "tag",
					"name": "b"
				}
			]
		],
		"multiple selectors"
	]
];

tests.forEach(function(arr, i){
	arr[0] = parse(arr[0]);
	assert.deepEqual.apply(null, arr);
	console.log("\t%d: '%s' passed", i + 1, arr[2]);
});

console.log("\nCollected selectors (qwery, sizzle, nwmatcher)...");

var out = require("./out.json");

Object.keys(out).forEach(function(s){
	assert.deepEqual(parse(s), out[s], s);
});

console.log("Passed!");
