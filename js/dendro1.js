/* jshint undef: true, strict:false, trailing:false, unused:false */
/* global d3, console, process, module, L, angular, _, $, jQuery, Backbone, window, clearTimeout, setTimeout */

var DATA_FILE = 'data/portus_500.csv', // whole dataset: 'data/portus_NOcomments.csv',
	data = d3.csv(DATA_FILE, function(err, data)  {

		// make a copy 
		window.raw_data = data.concat();

		var root = window.root = {},
			make_layer = function(id) { 
				return { name : id, children: [], size:1 };
			};

		data.map(function(row) { 
			if (row.parent_id && root[row.parent_id] === undefined) { 
				console.error('missing parent', row.id, row.parent_id, typeof(row.parent_id)); 
			} 
			if (row.parent_id) { 
				if(root[row.parent_id]) {
				  // console.info('pushing parent ', row.parent_id);
				  root[row.parent_id].children.push(row);
				  return;
				}
			}
			// no parent
			root[row.id] = { name : row.id, children: [], size:row.length };
			_(root[row.id]).extend(row); // add attributes
		});

		console.log('hierarchical tree! ', root);
		window.data = root; // for debug

		var width = jQuery('body').width(), 
			height = jQuery('body').height();

		var cluster = d3.layout.cluster()
			.size([height, width - 160]);

		var diagonal = d3.svg.diagonal()
			.projection(function(d) { return [d.y, d.x]; });

		var svg = d3.select('body').append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', 'translate(40,0)');

		var nodes = cluster.nodes({name:'potus', children:_(root).values().filter(function(x) { 
			  return x.children.length > 5; 
			})}),
			links = cluster.links(nodes);

		var link = svg.selectAll('.link')
			.data(links)
			.enter().append('path')
			.attr('class', 'link')
			.attr('d', diagonal);

		var node = svg.selectAll('.node')
			.data(nodes)
			.enter().append('g')
			.attr('class', 'node')
			.attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });

		node.append('circle')
			.attr('r', 4.5);

		node.append('text')
			.attr('dx', function(d) { return d.children ? -8 : 8; })
			.attr('dy', 3)
			.style('text-anchor', function(d) { return d.children ? 'end' : 'start'; })
			.text(function(d) { return d.name; });

		d3.select('body').style('height', height + 'px');

});
