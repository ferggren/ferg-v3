var React = require('react');
var Storage = require('components/storage');
var ContentWrapper = require('components/view/content-wrapper');

var AdminStorage = React.createClass({
	onFileSelect(file) {
		console.log(file);
	},

	render() {
		return (
			<ContentWrapper>
				<Storage 
					onFileUpload={this.onFileSelect}
					onFileSelect={this.onFileSelect}
					group="all"
					adminMode={true}
					media="all"
				/>
			</ContentWrapper>
		);
	},
});

module.exports = AdminStorage;