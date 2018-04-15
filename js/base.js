; (function () {
    'use strict';

    var $form_task_add = $('#task-add-submit')
        , $task_delete
        , $task_detail
        , $task_detail_info = $('.task-detail')
        , $task_detail_mask = $('.task-detail-mask')
        , task_list = []
        , current_index
        , $update_form
        , $task_detail_content
        , $task_detail_content_input
        ;


    init();
    // console.log('task_list',task_list);

    $("body").keydown(function () {
        if (event.keyCode == "13") {//keyCode=13是回车键
            $form_task_add.click();
        }
    });

    $form_task_add.click(function (e) {
        /* 禁用默认行为 */
        e.preventDefault();
        var new_task = {};
        var $input = $('#task-add-input');
        /* 获取新Task的值 */
        new_task.content = $input.val();

        if (!new_task.content) return;
        // console.log('new_task',new_task);
        if (add_task(new_task)) {
            // render_task_list();
            $input.val('');
        }

    });


    $task_detail_mask.click(function () {
        hide_task_detail();
    });

    /* 监听所有生成元素 */

    function listen_task_delete() {
        $task_delete.click(function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');
            var result = confirm('确定删除？');
            result ? delete_task(index) : null;
            //           console.log($item.data('index'));

        });
    }


    function listen_task_detail() {
        
        $('.task-item').dblclick(function () {
            var index = $(this).data('index');
            show_task_detail(index);
        })
        $task_detail.click(function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');
            //        console.log($item.data('index'));
            show_task_detail(index);
        })
    }


    // $form_task_add.on('submit', function (e) {
    //     /* 禁用默认行为 */
    //     e.preventDefault();
    //     /* 获取新Task的值 */
    //     new_task.content = $(this).find('input[name=content]').val();

    // })
    /* 查看任务详情 */
    function show_task_detail(index) {
        render_task_detail(index);
        current_index = index;
        $task_detail_info.show();
        $task_detail_mask.show();
    }
    /* 更新任务 */
    function update_task(index, data) {
        if (index === undefined || !task_list[index])
            return;
        task_list[index] = data;
        console.log(task_list[index]);
        refresh_task_list();
    }

    /* 渲染指定任务 */
    function render_task_detail(index) {
        if (index === undefined || !task_list[index]) return;

        var item = task_list[index];

        var tpl =
            '<form>'
            + '<div class="content">'
            + item.content
            + '</div>'
            + '<div class="input-item">'
            + '<input style="display:none;" type="text" name="content" value="'
            + item.content
            + '"></div>'
            + '<div>'
            + '<div class="desc input-item">'
            + '<textarea name="desc">'
            + (item.desc || '')
            + '</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="remind input-item">'
            + '<input type="date" name="remind_date" value="'
            + item.remind_date
            + '">'
            + '<button type="submit">更新</button>'
            + '<button type="reset">取消</button>'
            + '</div>'
            + '<form>';

        $task_detail_info.html(null);
        $task_detail_info.html(tpl);
        $update_form = $task_detail_info.find('form');
        $task_detail_content = $task_detail_info.find('.content');
        $task_detail_content_input = $task_detail_info.find('[name=content]');
        //    console.log($update_form);

        $task_detail_content.dblclick(function () {
            $task_detail_content.hide();
            $task_detail_content_input.show();
            // console.log(1);
        })

        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();
            //    console.log(data);
            update_task(index, data);
            $task_detail_info.hide();
            $task_detail_mask.hide();
        });

        $task_detail_info.find('[type=reset]').click(function () {
            $task_detail_info.hide();
            $task_detail_mask.hide();
        })
        
    }
    /* 隐藏任务详情 */
    function hide_task_detail() {
        $task_detail_info.hide();
        $task_detail_mask.hide();
    }
    /* 删除任务 */
    function delete_task(index) {
        if (index == undefined || !task_list[index]) return;

        delete task_list[index];
        refresh_task_list();
    }

    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    function add_task(new_task) {
        task_list.push(new_task);
        /* 更新localstorage */
        refresh_task_list();
        // console.log('task_list', task_list);
        // if (store.set('task_list', task_list)){
        //     console.log('task_list', task_list);
        // }
        return true;
    }
    /* 渲染任务列表 */
    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html(null);
        for (var i = 0; i < task_list.length; i++) {
            var $task = render_task_item(task_list[i], i);
            $task_list.prepend($task);
        }
        $task_delete = $('.action.delete');
        $task_detail = $('.action.detail');
        listen_task_delete();
        listen_task_detail();
    }

    function render_task_item(data, index) {
        if (!data || !index) return;
        var task_item_tpl =
            '<div class="task-item" data-index="'
            + index
            + '"><span>'
            + '<input type="checkbox" name="" id=""></span>'
            + '<span class="task-content">'
            + data.content
            + '</span>'
            + '<span class="floatright">'
            + '<span class="action delete">删除</span>'
            + '<span class="action detail">详情</span>'
            + '<span>'
            + '</div>';

        return task_item_tpl;
    }

    function init() {
        task_list = store.get('task_list') || [];
        render_task_list();
        // store.clearAll();
    }

})();