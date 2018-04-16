; (function () {
    'use strict';


    var $form_task_add = $('#task-add-submit')
    ,$body = $('body')
    ,$window = $(window)
        , $task_delete
        , $task_detail
        , $task_detail_info = $('.task-detail')
        , $task_detail_mask = $('.task-detail-mask')
        , task_list = []
        , current_index
        , $update_form
        , $task_detail_content
        , $task_detail_content_input
        ,$task_complete
        ,$msg = $('.msg')
        ,$msg_content = $msg.find('.msg-content')
        ,$msg_confirm = $msg.find('.confirmed')
        , $alerter = $('.alerter')
        ;


    init();



    // console.log('task_list',task_list);

    $("body").keydown(function () {
        if (event.keyCode == "13") {//keyCode=13是回车键
            $form_task_add.click();
        }
    });

    function my_alert(arg) {

        if(!arg){
            console.error('wrong');
        }

        var conf = {};
        var $box
        ,$mask
        ,$title
        ,$content
        ,$confirm
        ,$cancel
        ,dfd
        ,confirm_result
        ,timer
        ;

        dfd = $.Deferred();

        if (typeof arg == "string") {
            conf.title = arg;
        } else {
            conf = $.extend(conf, arg);
        }

        $box = $('<div>'
        + '<div class="alert-title">'
        + conf.title
        +'</div>'
        + '<div class="alert-content">'
        + '<div>'
        +'<button class="primary">确定</button>'
        +'<button class="cancel">取消</button>'
        +'</div>'
        + '</div>'
        + '</div>')
        .css({
            color:'#444',
            width:190,
            height:'auto',
            padding:'10px 10px',
            background: '#fff',
            position:'fixed',
            'border-radius':3,
            'box-shadow':'0 1px 2px rgba(0,0,0,0.4)',
        });

        $title = $box.find('.alert-title').css({
            padding: '5px 10px',
            'font-weight':900,
            'font-size':22,
            'text-align':'center',
        });
        $content = $box.find('.alert-content').css({
            padding: '5px 10px',
            'font-weight': 900,
            'text-align': 'center',

        });

        $confirm = $content.find('.primary').css({
            'margin-right':'15px',
        });

        $cancel = $content.find('.cancel');


        $mask = $('<div></div>')
        .css({
            position: 'fixed',
            top:0,
            bottom:0,
            left:0,
            right:0,
            background:'rgba(0,0,0,0.5)',
        });

        timer = setInterval(function () {
            if(confirm_result !== undefined){
                dfd.resolve(confirm_result);
                clearInterval(timer);
                dismiss_alert();
            }
        },50);

        $confirm.click(on_confirm);

        function on_confirm() {
            confirm_result = true;

        }

        function on_cancel() {
            confirm_result = false;
        }

        $cancel.click(on_cancel);

        $mask.click(on_cancel);

        function dismiss_alert() {
            $mask.remove();
            $box.remove();
        }

        function adjust_box() {
            // console.log($window.width());
            var window_width = $window.width()
            ,window_height = $window.height()
            ,box_width = $box.width()
            ,box_height = $box.height()
            ,move_x
            ,move_y
            ;

            move_x = (window_width - box_width)/2;
            move_y = (window_height - box_height)/2 - 30;

            $box.css({
                left:move_x,
                top:move_y,
            })

            // console.log($window.width(),$window.height(),$box.width(),$box.height());


        }
        $window.resize(function () {
            adjust_box();
        });


        $body.append($mask);
        $box.appendTo($body);
        $window.resize();
        return dfd.promise();
        // console.log(conf);
    }

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
            // var result = confirm('确定删除？');
            my_alert('确定删除')
                .then(function (r) {
                    r ? delete_task(index) : null;
                })
            //           console.log($item.data('index'));

        });
    }


    function listen_msg_event() {
        $msg_confirm.click(function () {
            hide_msg();
        })
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
/* 监听任务是否完成 */
    function listen_task_complete() {
        $task_complete.click(function () {
            var $this = $(this);
        //    var is_complete = $this.is(':checked');
            var index = $this.parent().parent().data('index');
            // console.log(index);
        //    update_task(index,{is_complete});
            var item = store.get('task_list')[index];
            if(item && item.complete){
                update_task(index,{complete:false});
                // $this.prop('checked',false);
            }else{
                update_task(index,{complete:true});
                // $this.prop('checked',true);
            }
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
            /* extend函数，将新值添加到旧值 */
        task_list[index] = $.extend({},task_list[index],data);
        refresh_task_list();
      //  console.log(task_list[index]);
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
            +'<label class="remind_label">提醒时间</label>'
            + '<input class="datetime" type="text" name="remind_date" value="'
            + (item.remind_date || '')
            + '">'
            + '<button type="submit" class="primary">更新</button>'
            + '<button type="reset" class="cancel">取消</button>'
            + '</div>'
            + '<form>';

        $task_detail_info.html(null);
        $task_detail_info.html(tpl);
        $(".datetime").datetimepicker();
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
        var complete_items = [];
        for (var i = 0; i < task_list.length; i++) {
            // var $task;
            var item = task_list[i];
            if(item && item.complete){
                complete_items[i] = item;
                // $task = render_task_item(item, i);
                // $task.find('.task-item').addClass('completed');
                // $task_list.append($task);

            }else
                var $task = render_task_item(item, i);
            $task_list.prepend($task);
        }
   //     console.log(complete_items);

        for(var j = 0;j < complete_items.length;j++){
            $task = render_task_item(complete_items[j], j);
            if(!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        // console.log(complete_items);

        // for (var j = 0; j < complete_items.length; j++) {
        //     var item = complete_items[j];

        //     var $task = render_task_item(item, j);

        //     $task_list.append($task);   
        // }

        $task_delete = $('.action.delete');
        $task_detail = $('.action.detail');
        $task_complete = $('.task-item .complete');
        listen_task_delete();
        listen_task_detail();
        listen_task_complete();
    }

    function render_task_item(data, index) {
        if (!data || !index) return;
        var task_item_tpl =
            '<div class="task-item" data-index="'
            + index
            + '"><span>'
            + '<input type="checkbox" name="" class="complete"'
            + (data.complete ? 'checked': '')
            +'></span>'
            + '<span class="task-content">'
            + data.content
            + '</span>'
            + '<span class="floatright">'
            + '<span class="action delete">删除</span>'
            + '<span class="action detail">详情</span>'
            + '<span>'
            + '</div>';

        return $(task_item_tpl);
    }

    function init() {
        task_list = store.get('task_list') || [];
        if(task_list.length){
            render_task_list();
        }
        listen_msg_event();
        task_remind_check();
        // store.clearAll();
    }

    function task_remind_check() {
        // show_msg();
        var current_timestamp;
        var itl = setInterval(function () {
            for (let i = 0; i < task_list.length; i++) {
                var item = store.get('task_list')[i];
                var task_timestamp;
                if (!item || !item.remind_date || item.informed) {
                    continue;
                }
                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();

                if (current_timestamp - task_timestamp >= 1) {
                    update_task(i,{informed:true});
                    show_msg(item.content);
                }

            }
        },500);
    }

    function show_msg(msg) {
        // console.log(1);
        if(!msg) return;
        $msg_content.text(msg);
        $alerter.get(0).play();
        $msg.show();
    }

    function hide_msg(msg) {
        // console.log(1);
        $msg.hide();
    }

})();