collab = {};
collab.settings = {
	host: 'http://localhost',
	port: 8001,
};	

if( typeof module == 'object' ) {
	module.exports.settings = collab.settings;
}