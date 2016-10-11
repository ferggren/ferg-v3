var React      = require('react');
var Groups     = require('./storage-options-groups.js');
var Categories = require('./storage-options-categories.js');
var OrderBy		 = require('./storage-options-orderby.js');

var Options = React.createClass({
	render() {
		return (
      <div className="storage__options-wrapper">
        <div className="storage__options">
        	<OrderBy />
          <Categories />
          <Groups />
        </div>
      </div>
    );
	}
});

module.exports = Options;