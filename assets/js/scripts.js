jQuery(document).ready(function($){

	// Modal
	Ink.requireModules( ['Ink.Dom.Selector_1','Ink.UI.Modal_1'], function( Selector, Modal ){
        var modalElement = Ink.s('#desktopModal');
        var modalObj = new Modal( modalElement );
    });

    // Tabs
    Ink.requireModules( ['Ink.Dom.Selector_1','Ink.UI.Tabs_1'], function( Selector, Tabs ){
        var tabsObj = new Tabs('#protoTabs');
    });

	// Animations
	$(".rwd-header").addClass("animated fadeInDown");
	$(".project-name").addClass("animated fadeInDown delay");
	$(".project-description").addClass("animated fadeInDown delay");
	$(".credits").addClass("animated fadeInUp");
	$(".sprite.brand-logo").addClass("animated fadeIn");

});