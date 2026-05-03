<?php defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {

    // Parent-CSS laden
    wp_enqueue_style(
        'jkd-parent-style',
        get_template_directory_uri() . '/style.css'
    );

    // Child-CSS nach dem Parent-CSS laden
    wp_enqueue_style(
        'jkd-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        ['jkd-parent-style'],
        wp_get_theme()->get( 'Version' )
    );

}, 20);