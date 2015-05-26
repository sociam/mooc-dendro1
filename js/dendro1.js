/* jshint undef: true, strict:false, trailing:false, unused:false */
/* global require, exports, console, process, module, L, angular, _, $, jQuery, Backbone, window, clearTimeout, setTimeout */


var DATA_FILE = 'data/portus_comments_clean220714.csv',
    data = d3.csv(DATA_FILE, function(err, data)  {
    var root = {};
    data.map(function(row) { 
        if (row.parent && !root[row.parent_id]) { 
          console.error('missing parent'); 
        } 
        if (row.parent_id) { 
          if(root[row.parent_id]) {
            console.info('pushing parent ', row.parent_id);
            root[row.parent_id].children.push(row);
            return;
          }
        }
        // no parent
        root[row.id] = { name : row.id, children: [], size:row.length };
        _(root[row.id]).extend(row);
    });
    console.log('hierarchical tree! ', root);
    window.data = root; // for debug

    var width = 960, height = 2200;

    var cluster = d3.layout.cluster()
        .size([height, width - 160]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(40,0)");

      var nodes = cluster.nodes({name:'potus', children:_(root).values().filter(function(x) { 
            return x.children.length > 10; 
          }).slice(0,500)}),
          links = cluster.links(nodes);

      var link = svg.selectAll(".link")
          .data(links)
        .enter().append("path")
          .attr("class", "link")
          .attr("d", diagonal);

      var node = svg.selectAll(".node")
          .data(nodes)
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

      node.append("circle")
          .attr("r", 4.5);

      node.append("text")
          .attr("dx", function(d) { return d.children ? -8 : 8; })
          .attr("dy", 3)
          .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
          .text(function(d) { return d.name; });

  d3.select('body').style("height", height + "px");

});
