/**
 * @file Site navigation
 * @name Navigation
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var { Link } = require('react-router');

require('./navigation.scss');
require('styles/partials/floating_clear');

var Navigation = React.createClass({
	render() {
		var url = window.location.pathname;
		
		var links = this.props.links.map((link) => {
			var className = '';

			if (url.match(link.match)) {
				className += ' site-menu__navigation--current ';
			}

			if (link.align == 'right') {
				className += ' site-menu__navigation--right ';
			}
			
			return (<li key={link.name} className={className}><Link to={link.link}>{link.name}</Link></li>);
		});

		return (
			<div>
				<div className="site-menu__wrapper">
					<div className="site-menu">
						<ul className="site-menu__navigation">
							{links}
						</ul>

						<div className="floating-clear" />
					</div>
				</div>
				
				<div className="site-menu__fixed-placeholder"></div>
			</div>
		)
	},
});

module.exports = Navigation;