/* jshint undef: true, strict:false, trailing:false, unused:false */
/* global d3, console, process, module, L, angular, _, $, jQuery, Backbone, window, clearTimeout, setTimeout */

var DATA_FILE = 'data/portus_500.csv', // whole dataset: 'data/portus_NOcomments.csv',
	data = d3.csv(DATA_FILE, function(err, data)  {

		var root = window.root = {},
			min_children = 3;

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

		var render = function() { 
			var subset = _(root).values().filter(function(x) { 
				  return x.children.length >= min_children; 
				}),
				nodes = cluster.nodes({name:'potus', children:subset}),
				links = cluster.links(nodes);

			console.info('subset is now ', subset.length, min_children, typeof(min_children));

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
				.text(function(d) { return d.name || d.id; });
		};

		d3.select('body').style('height', height + 'px');
		render();

		// debugg stuff
		// make a copy 
		window.raw_data = data.concat();
		window.data = root; // for debug		

		$('#cutoff').on('input', function(x) { 
			min_children = parseInt($("#cutoff").val());
			svg.selectAll("*").remove();
			$("#cutoffDisplay").html(min_children);
			render();
		});
		$("#cutoffDisplay").html(min_children);
});
