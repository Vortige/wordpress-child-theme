<?php defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {

    $theme_version = wp_get_theme()->get( 'Version' );
    $child_dir     = get_stylesheet_directory();
    $child_uri     = get_stylesheet_directory_uri();

    $child_style_version = file_exists( $child_dir . '/style.css' )
        ? filemtime( $child_dir . '/style.css' )
        : $theme_version;

    $boxzilla_fix_version = file_exists( $child_dir . '/boxzilla-scroll-fix.js' )
        ? filemtime( $child_dir . '/boxzilla-scroll-fix.js' )
        : $theme_version;

    // Parent-CSS laden
    wp_enqueue_style(
        'jkd-parent-style',
        get_template_directory_uri() . '/style.css'
    );

    // Child-CSS nach dem Parent-CSS laden
    wp_enqueue_style(
        'jkd-child-style',
        $child_uri . '/style.css',
        ['jkd-parent-style'],
        $child_style_version
    );

    wp_enqueue_script(
        'jkd-boxzilla-scroll-fix',
        $child_uri . '/boxzilla-scroll-fix.js',
        [],
        $boxzilla_fix_version,
        true
    );

}, 20);