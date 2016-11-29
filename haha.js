var a = {
    "none": {
        "data": [{
                "key": "tags",
                "selector": [
                    ".featureTag span"
                ],
                "removeSelector": [],
                "data": [{
                    "key": "",
                    "selector": [],
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "formats": [{
                        "str": []
                    }],
                    "htmlStrategy": "jsdom",
                    "dealStrategy": "normal"
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "array"
            },
            {
                "key": "sellingPoint",
                "selector": [
                    "h1.main"
                ],
                "removeSelector": [],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            }
        ]
    },
    "album": {
        "data": [{
            "key": "pictures",
            "selector": [
                "li"
            ],
            "removeSelector": [],
            "data": [{
                    "key": "title",
                    "selector": [
                        "img"
                    ],
                    "removeSelector": [],
                    "methodInfo": {
                        "attr": [
                            "img-title"
                        ]
                    },
                    "formats": [{
                        "str": []
                    }],
                    "htmlStrategy": "jsdom",
                    "dealStrategy": "normal"
                },
                {
                    "key": "url",
                    "selector": [
                        "img"
                    ],
                    "removeSelector": [],
                    "methodInfo": {
                        "attr": [
                            "data-large"
                        ]
                    },
                    "formats": [{
                        "str": []
                    }],
                    "htmlStrategy": "jsdom",
                    "dealStrategy": "normal"
                }
            ],
            "htmlStrategy": "jsdom",
            "dealStrategy": "array"
        }]
    },
    "baseInfo": {
        "data": [{
                "key": "sumPrice",
                "selector": [
                    ".houseInfo .price"
                ],
                "removeSelector": [],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            },
            {
                "key": "sumArea",
                "selector": [
                    ".houseInfo .area"
                ],
                "removeSelector": [],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            }
        ]
    },
    "moreInfo": {
        "selector": "tr td",
        "dealStrategy": "jsdom",
        "data": [{
            "selector": [],
            "removeSelector": [],
            "htmlStrategy": "jsdom",
            "data": [{
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "单价",
                    "data": [{
                        "key": "price",
                        "selector": [],
                        "removeSelector": [
                            ".title"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "num": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "楼层",
                    "data": [{
                        "key": "floor",
                        "selector": [],
                        "removeSelector": [
                            ".title"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "年代",
                    "data": [{
                        "key": "completingTime",
                        "selector": [

                        ],
                        "removeSelector": [
                            ".title"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "装修",
                    "data": [{
                        "key": "decoration",
                        "selector": [

                        ],
                        "removeSelector": [
                            ".title"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "朝向",
                    "data": [{
                        "key": "toward",
                        "selector": [

                        ],
                        "removeSelector": [
                            ".title"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "首付",
                    "data": [{
                        "key": "downPayment",
                        "selector": [],
                        "removeSelector": [
                            ".title"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "月供",
                    "data": [{
                        "key": "monthPayment",
                        "selector": [],
                        "removeSelector": [
                            ".title"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "月供",
                    "data": [{
                        "key": "community",
                        "selector": [
                            "a"
                        ],
                        "removeSelector": [],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "小区",
                    "data": [{
                        "key": "community",
                        "selector": [
                            "a"
                        ],
                        "removeSelector": [],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "小区",
                    "data": [{
                        "key": "plate",
                        "selector": [
                            ".areaEllipsis"
                        ],
                        "removeSelector": [],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".title",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "地址",
                    "data": [{
                        "key": "address",
                        "selector": [
                            ".addrEllipsis"
                        ],
                        "removeSelector": [],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                }
            ],
            "dealStrategy": "switch"
        }]
    },
    "basicInfo": {
        "data": [{
                "key": "layout",
                "selector": [
                    "li:eq(0)"
                ],
                "removeSelector": [
                    ".label"
                ],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            },
            {
                "key": "floorScale",
                "selector": [
                    "li:eq(4)"
                ],
                "removeSelector": [
                    ".label"
                ],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            }
        ]
    },
    "basicTransactionInfo": {
        "data": [{
                "key": "prevTrade",
                "selector": [
                    "li:eq(0)"
                ],
                "removeSelector": [
                    ".label"
                ],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": [],
                    "date": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            },
            {
                "key": "type",
                "selector": [
                    "li:eq(1)"
                ],
                "removeSelector": [
                    ".label"
                ],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            },
            {
                "key": "yearLimit",
                "selector": [
                    "li:eq(2)"
                ],
                "removeSelector": [
                    ".label"
                ],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            },
            {
                "key": "isOnly",
                "selector": [
                    "li:eq(3)"
                ],
                "removeSelector": [
                    ".label"
                ],
                "methodInfo": {
                    "text": []
                },
                "formats": [{
                    "str": []
                }],
                "htmlStrategy": "jsdom",
                "dealStrategy": "normal"
            }
        ]
    },
    "featureContent": {
        "data": [{
            "selector": [],
            "removeSelector": [],
            "data": [{
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "户型介绍",
                    "data": [{
                        "key": "layoutIntro",
                        "selector": [
                            ".text"
                        ],
                        "removeSelector": [
                            "i"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "formats": [{
                            "str": []
                        }],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "装修描述",
                    "data": [{
                        "key": "decorationIntro",
                        "selector": [
                            ".text"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "removeSelector": [],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "税费解析",
                    "data": [{
                        "key": "taxIntro",
                        "selector": [
                            ".text"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "removeSelector": [],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "售房原因",
                    "data": [{
                        "key": "saleReasonIntro",
                        "selector": [
                            ".text"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "removeSelector": [],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "投资分析",
                    "data": [{
                        "key": "investmentIntro",
                        "selector": [
                            ".text"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "removeSelector": [],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "交通出行",
                    "data": [{
                        "key": "trafficIntro",
                        "selector": [
                            ".text"
                        ],
                        "methodInfo": {
                            "text": []
                        },
                        "removeSelector": [],
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "小区介绍",
                    "data": [{
                        "key": "communityIntro",
                        "selector": [
                            ".text"
                        ],
                        "removeSelector": [],
                        "methodInfo": {
                            "text": []
                        },
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "周边配套",
                    "data": [{
                        "key": "circumIntro",
                        "selector": [
                            ".text"
                        ],
                        "removeSelector": [],
                        "methodInfo": {
                            "text": []
                        },
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                },
                {
                    "selector": ".label",
                    "removeSelector": [],
                    "methodInfo": {
                        "text": []
                    },
                    "match": "我来介绍",
                    "data": [{
                        "key": "ownerIntro",
                        "selector": [
                            ".text"
                        ],
                        "removeSelector": [],
                        "methodInfo": {
                            "text": []
                        },
                        "htmlStrategy": "jsdom",
                        "dealStrategy": "normal"
                    }],
                    "dealStrategy": "case"
                }
            ],
            "htmlStrategy": "jsdom",
            "dealStrategy": "switch"
        }]
    }
}