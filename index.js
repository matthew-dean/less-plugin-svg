module.exports = {
  install: function(less, pluginManager, functions) {

    function htmlAttr(decl) {
      if (decl instanceof less.tree.Declaration) {
        return decl.name[0].value + '="' + decl.value.toCSS() + '" ';
      }
      return ''
    }
    
    function styleProps(rules) {
      var str = 'style="';
      rules.forEach(function(decl) {
        if (decl instanceof less.tree.Declaration) {
          str += decl.name[0].value + ':' + decl.value.toCSS() + ';';
        }
      })
      str += '" ';
      return str;
    }
    
    var nodeStack = [];

    functions.add('svg', function(arg) {
      var rules;
      if (arg.ruleset) {
        rules = arg.ruleset.rules;
      } else if (arg.rules) {
        rules = arg.rules;
      } else if (Array.isArray(arg)) {
        rules = arg;
      } else {
        rules = [arg];
      }
      var str = '<svg xmlns="http://www.w3.org/2000/svg" ';
      nodeStack.push('svg');

      function addRules(rules) {
        rules.forEach(function(rule) {
          if (rule instanceof less.tree.Declaration) {
            str += htmlAttr(rule);
          } else {
            var sel = rule.selectors[0].toCSS().trim();
            if (sel === 'style') {
              str += styleProps(rule.rules);
            } else {
              str += '><' + sel + ' ';
              nodeStack.push(sel);
              addRules(rule.rules);
            }
          }
        });
        str += '></' + nodeStack.pop();
      }

      addRules(rules);
      str += '>';

      console.log(str);
      var returner, index = arg.getIndex(), fileInfo = arg.fileInfo();

      returner = 'data:image/svg+xml,' + encodeURIComponent(str);
      return new less.tree.URL(new less.tree.Quoted('\'' + returner + '\'', returner, false, index, fileInfo), index, fileInfo);
    })
  }
}
