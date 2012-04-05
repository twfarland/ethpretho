(function() {
  var applyAllSubs, applySub, args, ast, clump, clumpSeq, clumpTmpl, fs, log, splitByElip, subsFromPattern, substitute, toSeqs, _;

  fs = require('fs');

  _ = require('../src/utils.js');

  toSeqs = require('../src/toSeqs.js');

  args = process.argv.splice(2);

  log = _.log;

  ast = _.assert(args[0]);

  splitByElip = toSeqs.splitByElip;

  clump = toSeqs.clump;

  clumpSeq = toSeqs.clumpSeq;

  clumpTmpl = toSeqs.clumpTmpl;

  subsFromPattern = toSeqs.subsFromPattern;

  applySub = toSeqs.applySub;

  applyAllSubs = toSeqs.applyAllSubs;

  substitute = toSeqs.substitute;

  log('--splitByElip');

  ast(splitByElip(['f', '...'], ['1', '2', '3']), [['f'], [], ['1', '2', '3'], []]);

  ast(splitByElip(['f', '...', 'g'], ['1', '2', '3']), [['f'], ['g'], ['1', '2'], ['3']]);

  ast(splitByElip([['f', 'g'], '...'], [['1', '2'], ['2', '3']]), [[['f', 'g']], [], [['1', '2'], ['2', '3']], []]);

  log('--clumpSeq - ok');

  ast(clumpSeq([['f'], ['1', '2', '3']], [[], []]), [
    [
      {
        seq: ['f']
      }
    ], [
      {
        seq: ['1', '2', '3']
      }
    ]
  ]);

  ast(clumpSeq([[['f']], [['1'], ['2'], ['3']]], [[], []]), [
    [
      {
        seq: [['f']]
      }
    ], [
      {
        seq: [['1'], ['2'], ['3']]
      }
    ]
  ]);

  ast(clumpSeq([[['f', 'g']], [['1', '2'], ['2', '3'], ['3', '4']]], [[], []]), [
    [
      {
        seq: [['f', 'g']]
      }
    ], [
      {
        seq: [['1', '2'], ['2', '3'], ['3', '4']]
      }
    ]
  ]);

  ast(clumpSeq([[['f', ['g']]], [['1', ['2']], ['2', ['3']]]], [[], []]), [
    [
      {
        seq: [['f', ['g']]]
      }
    ], [
      {
        seq: [['1', ['2']], ['2', ['3']]]
      }
    ]
  ]);

  ast(clumpSeq([['f'], []], [[], []]), [
    [
      {
        seq: ['f']
      }
    ], [
      {
        seq: []
      }
    ]
  ]);

  log('--clumpSeq - fail');

  ast(clumpSeq([['f'], ['1', '2', ['3']]], [[], []]), false);

  ast(clumpSeq([[['f', 'g']], [['1'], ['2'], ['3', '4']]], [[], []]), false);

  ast(clumpSeq([[['f', ['g']]], [['1', ['2']], ['2', '3']]], [[], []]), false);

  log('--clump - ok');

  ast(clump([[], []], [[], []]), [[], []]);

  ast(clump([['f'], ['1']], [[], []]), [['f'], ['1']]);

  ast(clump([['f', 'g', 'h'], ['1', '2', '3']], [[], []]), [['f', 'g', 'h'], ['1', '2', '3']]);

  ast(clump([[['f']], [['1']]], [[], []]), [[['f']], [['1']]]);

  ast(clump([[['f'], 'g'], [['1'], '2']], [[], []]), [[['f'], 'g'], [['1'], '2']]);

  ast(clump([['h', ['f', 'x'], 'g'], ['3', ['1', '4'], '2']], [[], []]), [['h', ['f', 'x'], 'g'], ['3', ['1', '4'], '2']]);

  ast(clump([['f', '...'], ['1', '2', '3']], [[], []]), [
    [
      {
        seq: ['f']
      }
    ], [
      {
        seq: ['1', '2', '3']
      }
    ]
  ]);

  ast(clump([['f', '...', 'g'], ['1', '2', '3']], [[], []]), [
    [
      {
        seq: ['f']
      }, 'g'
    ], [
      {
        seq: ['1', '2']
      }, '3'
    ]
  ]);

  ast(clump([['f', 'g', '...'], ['1', '2', '3']], [[], []]), [
    [
      'f', {
        seq: ['g']
      }
    ], [
      '1', {
        seq: ['2', '3']
      }
    ]
  ]);

  ast(clump([[['f'], '...'], [['1'], ['2'], ['3']]], [[], []]), [
    [
      {
        seq: [['f']]
      }
    ], [
      {
        seq: [['1'], ['2'], ['3']]
      }
    ]
  ]);

  ast(clump([['f', '...'], []], [[], []]), [
    [
      {
        seq: ['f']
      }
    ], [
      {
        seq: []
      }
    ]
  ]);

  ast(clump([[['f'], '...'], []], [[], []]), [
    [
      {
        seq: [['f']]
      }
    ], [
      {
        seq: []
      }
    ]
  ]);

  ast(clump([[['f'], '...', 'g'], [['1'], '4']], [[], []]), [
    [
      {
        seq: [['f']]
      }, 'g'
    ], [
      {
        seq: [['1']]
      }, '4'
    ]
  ]);

  ast(clump([['g', ['f'], '...'], ['1']], [[], []]), [
    [
      'g', {
        seq: [['f']]
      }
    ], [
      '1', {
        seq: []
      }
    ]
  ]);

  ast(clump([[['f', 'g'], '...'], [['1', '2'], ['2', '3']]], [[], []]), [
    [
      {
        seq: [['f', 'g']]
      }
    ], [
      {
        seq: [['1', '2'], ['2', '3']]
      }
    ]
  ]);

  ast(clump([[['f', '...'], '...'], [['1', '2'], ['2']]], [[], []]), [
    [
      {
        seq: [
          [
            {
              seq: ['f']
            }
          ]
        ]
      }
    ], [
      {
        seq: [
          [
            {
              seq: ['1', '2']
            }
          ], [
            {
              seq: ['2']
            }
          ]
        ]
      }
    ]
  ]);

  log('--clump - fail');

  ast(clump([['f'], []], [[], []]), false);

  ast(clump([[], ['1']], [[], []]), false);

  ast(clump([['f'], ['1', '2']], [[], []]), false);

  ast(clump([['f', 'g'], ['1']], [[], []]), false);

  ast(clump([[['f']], []], [[], []]), false);

  ast(clump([[['f']], ['1']], [[], []]), false);

  log('--clumpTmpl');

  ast(clumpTmpl([]), []);

  ast(clumpTmpl(['f']), ['f']);

  ast(clumpTmpl(['f', 'g', 'h']), ['f', 'g', 'h']);

  ast(clumpTmpl(['f', '...']), [
    {
      seq: ['f']
    }
  ]);

  ast(clumpTmpl([['f'], '...']), [
    {
      seq: [['f']]
    }
  ]);

  ast(clumpTmpl([['f', 'g'], '...']), [
    {
      seq: [['f', 'g']]
    }
  ]);

  ast(clumpTmpl(['h', ['f', 'g'], '...', 'i']), [
    'h', {
      seq: [['f', 'g']]
    }, 'i'
  ]);

  ast(clumpTmpl([['f', '...'], '...']), [
    {
      seq: [
        [
          {
            seq: ['f']
          }
        ]
      ]
    }
  ]);

  ast(clumpTmpl([['f', '...', 'g'], '...', 'h']), [
    {
      seq: [
        [
          {
            seq: ['f']
          }, 'g'
        ]
      ]
    }, 'h'
  ]);

  /*
  log '--trySubst - ok'
  ast trySubst([],[],[]), []
  ast trySubst(['f'],['1'],['f']), [{sub: 'f', w: '1'}]
  ast trySubst(
          ['id', [{seq: ['pairs']}], 'p','b'],
          ['+',  [{seq: ['1','2','3']}], '4', '5'],
          ['id', {seq: ['pairs']}, ['p','b']]
  ), [
          {sub: 'id', w: '+'},
          {sub: {seq: ['pairs']}, w: {seq: ['1','2','3']}},
          [{sub:'p',w:'4'},
          {sub:'b',w:'5'}]
     ]
  */

  log('--subsFromPattern - ok');

  log(subsFromPattern([
    'id', [
      {
        seq: ['pairs']
      }
    ], 'p', 'b'
  ], [
    '+', [
      {
        seq: ['1', '2', '3']
      }
    ], '4', '5'
  ]));

  log(subsFromPattern(['x', ['y', 'z']], ['1', ['2', '3']]));

  log(subsFromPattern([
    'x', [
      'y', {
        seq: ['z']
      }
    ]
  ], [
    '1', [
      '2', {
        seq: ['3', '4']
      }
    ]
  ]));

  log(subsFromPattern([
    {
      seq: [['x', 'y']]
    }
  ], [
    {
      seq: [['1', '2'], ['3', '4']]
    }
  ]));

  log('--applySub - ok');

  log(applySub(function(sub, e) {
    return sub;
  })({
    from: 'x',
    to: '1'
  }, ['y', 'x', 'z']));

  log('--trySubst');

  log(substitute(['x', 'y'], ['1', '2'], ['z', 'x', 'y', 'tmp'], [
    {
      from: 'tmp'
    }
  ]));

  log('--trySubst - scoping safely');

  log(substitute(['x', 'y'], ['tmp', 'other'], ['let', [['tmp', 'x']], ['=', 'x', 'y'], ['=', 'y', 'tmp']], [
    {
      from: 'tmp',
      to: '5'
    }, {
      from: 'other',
      to: '6'
    }
  ]));

}).call(this);
