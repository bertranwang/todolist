; (function () {
    'use strict';

    var $form_task_add = $('#task-add-submit')
        , $task_delete
        , task_list = []
        ;


    init();
    // console.log('task_list',task_list);

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

    /* 监听所有生成元素 */

    function listen_task_delete() {
        $task_delete.click(function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');
            var result = confirm('确定删除？');
            result ? delete_task(index) : null;
            // console.log($item.data('index'));

        });
    }





    // $form_task_add.on('submit', function (e) {
    //     /* 禁用默认行为 */
    //     e.preventDefault();
    //     /* 获取新Task的值 */
    //     new_task.content = $(this).find('input[name=content]').val();

    // })

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

    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        for (var i = 0; i < task_list.length; i++) {
            var $task = render_task_item(task_list[i], i);
            $task_list.append($task);
        }
        $task_delete = $('.action.delete');
        listen_task_delete();
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
            + '<span class="action detail">详细</span>'
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