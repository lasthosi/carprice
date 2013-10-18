/// <reference path="../../js/jquery.js"/>
/// <reference path="input.js"/>
(function () {
    $.ajaxSettings.timeout = 5000;
    function unique(key) {
        return (key || unique.key) + unique.i++;
    }
    unique.i = 1;
    unique.key = 'mx';
    function win_begin_wait() {
        var count = win_begin_wait.count || 0;
        count++;
        win_begin_wait.count = count;
        var id = win_begin_wait.id;
        if (!id) {
            win_begin_wait.id = id = unique('win_wait_panel');
            $('html').append('<div style="display:none;" class="wait-win" id="' + id + '"></div>');
        }
        var elt = $('#' + id);
        if (elt.css('display') === 'block') return;
        elt.css('display', 'block');
        elt.css('opacity', 0.01);
        elt.animate({ opacity: 0.6 }, 600);
    }
    function win_end_wait() {
        var count = win_begin_wait.count || 0;
        if (count === 0) return;
        count--;
        win_begin_wait.count = count;
        if (count <= 0) {
            var id = win_begin_wait.id;
            if (!id) return;
            var elt = $('#' + id);
            elt.stop();
            elt.css('display', 'none');
        }
    }
    function ajaxJson(url, success, options) {
        if (!options) options = {};
        options.dataType = 'json';
        options.success = function (data, textStatus, jqXHR) {
            if (!data.access) {
                alert('你无权进行此操作，请使用具有权限的管理员帐号重新登陆。');
                // 没权限，转到登陆
                return;
            }
            if (!data.ok) {
                if (typeof (fail) === 'function') fail.call(this);
                return;
            }
            if (typeof (success) === 'function') success.call(this, data.result, textStatus, jqXHR);
        };
        return $.ajax(url, options);
    }
    function getJson(url, data, success, error, complete) {
        return ajax(url, success, error, {
            complete: complete,
            dataType: 'json'
        });
    }
    function resize() {
        var w = $(window), ch = w.outerHeight();
        $('html').outerHeight(ch);
        $('#head').width($('#client_w').width());
    }
    var html_res = {};
    var res = {
        data_state: {
            '-1': '已删除', '0': '已修改', '1': '新建项', '100': '已同步'
        }
    };
    var fn = {
        search: {
            pageSize: 10,
            convertResult: function (result) {
                var data = { list: [], group: [] }, group_dict = {};
                data.group_dict = group_dict;
                $.each(result, function (data, group_dict) {
                    var item = { id: this.id, define_id: this.did };
                    data.list.push(item);
                    var v = fn.peijian.dict.find(this.did), cls = group_dict[v.cls.id];
                    item.sort = v.child.sort;
                    item.cls_sort = v.cls.sort;
                    item.define = v.child;
                    if (!cls) {
                        data.group.push(cls = group_dict[v.cls.id] = { cls_id: v.cls.id, sort: v.cls.sort, cls: v.cls, list: [] });
                    }
                    cls.list.push(item);
                }, [data, group_dict]);
                data.list.sort(function (a, b) {
                    return a.cls_sort > b.cls_sort ? 1 : a.cls_sort < b.cls_sort ? -1 : a.sort > b.sort ? 1 : a.sort < b.sort ? -1 : 0;
                });
                data.group = fn.data.sortData(data.group);
                $.each(data.group, function () {
                    this.list = fn.data.sortData(this.list);
                });
                return data;
            }
        },
        htmlRes: {
            cache: {},
            get: function (name) {
                if (typeof (this.cache[name]) === 'string') return this.cache[name];
                var $elt = $('#htmlres [data-res="' + name + '"]:first');
                var html = this.cache[name] = $elt.html();
                $elt.remove();
                return html;
            }
        },
        page: {
            pt: {
                init: function () {
                    if (this._initialized) return true;
                    this._initialized = true;
                    return false;
                },
                elt: function () {
                    return $('#content>div.page.' + this.name + ':first');
                },
                show: function () {
                    this.init();
                    $('#app-title').text(this.title);
                    var elt = this.elt();
                    elt.css('display', 'block');
                    $('#menu a[data-name=' + this.name + ']').addClass('active');
                    elt.css('left', '40px');
                    elt.animate({ 'left': 0 }, 200);
                },
                hide: function () {
                    var elt = this.elt();
                    elt.css('display', 'none');
                    $('#menu a[data-name=' + this.name + ']').removeClass('active');
                }
            },
            expand: function (title, name, fs) {
                var f = function () { };
                f.prototype = this.pt;
                var obj = new f();
                for (var key in fs) {
                    if (fs.hasOwnProperty(key)) {
                        obj[key] = fs[key];
                    }
                }
                obj.title = title;
                obj.name = name;
                obj.base = function (name, args) {
                    if (arguments.length === 0) {
                        return f.prototype;
                    }
                    var fun = f.prototype[name];
                    if (typeof (fun) === 'function') return fun.call(this, args || []);
                    return fun;
                };
                return obj;
            }
        },
        input: {
            onerror: function (e) {
                var input = $(e.target), err = input.attr('data-error');
                if (err) {
                    var div = document.createElement('div'), id;
                    $('#frame-container').append(div);
                    div = $(div);
                    div.text(err);
                    div.addClass('frame-error');
                    var body = $('#body'), pos = input.offsetBy(body);
                    div.css('left', pos.left + 'px');
                    div.css('top', pos.top + body.scrollTop() + input.outerHeight() + 'px');
                    div.css('display', 'none');
                    div.stop().fadeIn(600);
                    function hide() {
                        if (id) window.clearTimeout(id);
                        id = false;
                        input.unbind('focusout', hide);
                        div.fadeOut(300, null, function () {
                            div.remove();
                            div = null;
                        });
                    }
                    input.stop().focusout(hide);
                    id = window.setTimeout(hide, 5000);
                }
            },
            error: function ($input, msg) {
                if (msg) {
                    $input.addClass('error');
                    $input.attr('data-error', msg);
                } else {
                    $input.removeClass('error');
                    $input.removeAttr('data-error');
                }
            },
            types: {
                '': function ($input, result, keyName) {
                    var value = $input.val(), min = parseInt($input.attr('minlength')), max = parseInt($input.attr('maxlength'));
                    if (!isNaN(min) && value.length < min) {
                        fn.input.error($input, '字符串长度太短');
                        return false;
                    }
                    if (!isNaN(max) && value.length > max) {
                        fn.input.error($input, '字符串长度太长');
                        return false;
                    }
                    fn.input.error($input);
                    if (result) result[keyName] = value;
                    return true;
                },
                int: function ($input, result, keyName) {
                    var value = $input.val(), min = parseInt($input.attr('data-min')), max = parseInt($input.attr('data-max'));
                    if (!/^-{0,1}[0-9]{1,}$/.test(value)) {
                        fn.input.error($input, '整数格式错误');
                        return false;
                    }
                    value = parseInt(value);
                    if (!isNaN(min) && value < min) {
                        fn.input.error($input, '小于最小值' + min);
                        return false;
                    }
                    if (!isNaN(max) && value > max) {
                        fn.input.error($input, '大于最大值' + max);
                        return false;
                    }
                    fn.input.error($input);
                    if (result) result[keyName] = value;
                    return true;
                }
            },
            test: function ($input, result, keyName) {
                var type = $input.attr('data-type') || '';
                if (typeof (this.types[type]) !== 'function') {
                    if (result) {
                        result[keyName] = $input.val();
                    }
                    result[keyName] = $input.val();
                    return true;
                }
                return this.types[type]($input, result, keyName);
            }
        },
        tab: {
            on_active: function (e) {
                var tgt = $(e.currentTarget);
                var i = tgt.prevAll('a').size();
                tgt.parent().children().removeClass('active');
                tgt.addClass('active');
                var tabPanel = tgt.parent().parent().find('div.tab-panel:first');
                var cs = tabPanel.children();
                cs.css('display', function (index) {
                    if (index === i) return 'block'; else return 'none';
                });
            },
            disable: function () {

            }
        },
        disable: function (selector, disabled) {
            if (!selector) return;
            if (typeof (selector.selector) === 'undefined') {
                selector = $(selector);
            }
            if (disabled) {
                selector.addClass('disabled');
            } else {
                selector.removeClass('disabled');
            }
        },
        inputTags: 'input,select,',
        isInput: function (elt) {
            return this.inputTags.indexOf(elt.prop('tagName').toLowerCase() + ',') > -1;
        },
        selectButton: {
            val: function (btn, v, t) {
                if (arguments.length > 1) {
                    var ov = btn.attr('data-value') || '', ot = this.text(btn);
                    if (!v) v = '';
                    if (ov != v) {
                        btn.attr('data-value', v);
                        if (!v) this.text(btn, btn.attr('data-empty'));
                        if (arguments.length > 2) {
                            this.text(btn, t || '');
                        }
                        $(btn).trigger('_change', { value: ov, text: ot });
                        return true;
                    }
                    return false;
                } else if (arguments.length === 1) {
                    return btn.attr('data-value');
                }
            },
            reset: function (btn, v, t) {
                btn.attr('data-value', v);
                this.text(btn, t);
            },
            text: function (btn, t) {
                switch (arguments.length) {
                    case 1:
                        return btn.find('span.value:first').text();
                    case 2:
                        btn.find('span.value:first').text(t);
                        break;
                }
            },
            dlg: function ($btn, classs, list, keyName, valueName) {
                var body = $('#body'), pos = $btn.offsetBy(body);
                fn.selectDialog('', pos.left, body.scrollTop() + pos.top + $btn.outerHeight() - 1, list, keyName, valueName, function (k, v) {
                    fn.selectButton.val(this, k, v);
                }, $btn);
            }
        },
        selectDialog: function (classs, x, y, list, keyName, valueName, callback, context) {
            var div = document.createElement('div');
            $('#frame-container').append(div);
            div = $(div);
            div.addClass('select-dlg').addClass(classs || '');
            div.html(fn.htmlRes.get("select-dlg"));
            var listDiv = div.find('div.list:first');
            $.each(list, function () {
                listDiv.append('<a></a>');
                listDiv.children().last().attr('data-key', this[keyName]).text(this[valueName]);
            });
            div.css({
                left: x + 'px',
                top: y + 'px'
            });
            var h = div.height();
            div.css('height', '0px').animate({ height: h + 'px' }, 200, '', function () {
                div.css('height', '');
            });
            function hide() {
                $(document).unbind('mousedown', hide);
                listDiv.unbind();
                div.remove();
                div = callback = context = listDiv = null;
            }
            $(document).mousedown(hide);
            listDiv.mousedown(function (e) {
                e.stopPropagation();
                var tgt = $(e.target);
                if (tgt.prop('tagName').toLowerCase() !== 'a') {
                    tgt = tgt.parents('a:first');
                    if (tgt.size() === 0) return;
                }
                var key = tgt.attr('data-key');
                if (typeof (key) !== 'undefined') {
                    if (typeof (callback) === 'function') {
                        if (context) callback.call(context, key, tgt.text()); else callback(key, tgt.text());
                    }
                    hide();
                }
            });
        },
        multiSelectDialog: function (classs, opts, except_opts, opts_struct, callback, context) {
            var div = document.createElement('div');
            $('html').append(div);
            div = $(div);
            div.css('opacity', 0.01);
            div.addClass('multi-select-dlg').addClass(classs || '');
            div.html(fn.htmlRes.get("multi-select-dlg"));
            div.fadeTo(300, 1);
            // 处理选择项
            $.each(opts, function ($listDiv, opts_struct, except_opts) {
                var key = this[opts_struct.group_key], text = typeof (opts_struct.group_text) === 'function' ? opts_struct.group_text(this) : this[opts_struct.group_text];
                var count = 0, list = $.map(this[opts_struct.list_key], function (v, k) {
                    var rt = { v: v };
                    $.each(except_opts, function (rt, opts_struct) {
                        if (rt.v[opts_struct.child_key] == this) {
                            rt.v = null;
                            return false;
                        }
                    }, [rt, opts_struct]);
                    return rt.v;
                });
                if (list.length === 0) return;
                var group_div = $listDiv.append('<div class="group"><div class="bar"><span class="ico"></span><span class="text"></span></div><div class="list-child"></div></div>').children('.group').last();
                group_div.data('key', key);
                var bar_div = group_div.children('.bar'), list_div = group_div.children('.list-child');
                bar_div.children('.text').text(text);
                bar_div.children('.ico').text('-');
                $.each(list, function (list_div, opts_struct) {
                    var key = this[opts_struct.child_key], text = typeof (opts_struct.child_text) === 'function' ? opts_struct.child_text(this) : this[opts_struct.child_text];
                    list_div.append('<a class="opt"><span class="ico"></span><span class="text"></span></a>').children('a.opt').last().data('key', key).children('.text').text(text);
                }, [list_div, opts_struct]);
            }, [div.children('.in').children('.list'), opts_struct, except_opts]);
            function hide() {
                div.stop().fadeOut(400, function () {
                    $(this).remove();
                });
                div.undelegate();
                div = null;
            }
            function complete() {
                if (typeof (callback) === 'function') {
                    var data = div.find('div.group').map(function (i, group_elt) {
                        var group = $(group_elt), list = group.find('a.opt.checked').map(function (j, elt) {
                            return $(elt).data('key');
                        }).get();
                        if (list.length > 0) return { key: group.data('key'), list: list };
                    }).get();
                    if (data.length > 0) {
                        if (context) callback.call(context, data); else callback(data);
                    }
                }
                hide();
            }
            div.delegate('a[data-fun]:not(.disabled)', 'click', function (e) {
                var tgt = $(e.currentTarget);
                switch (tgt.attr('data-fun')) {
                    case 'hide':
                        hide();
                        break;
                    case 'true':
                        complete();
                        break;
                    case 'open-all':
                        div.find('div.list>div.group>div.list-child').slideDown(300, function () {
                            $(this).css('display', 'block').prev().children('.ico').text('-');
                        });
                        break;
                    case 'close-all':
                        div.find('div.list>div.group>div.list-child').slideUp(300, function () {
                            $(this).css('display', 'none').prev().children('.ico').text('+');
                        });
                        break;
                }
            }).delegate('div.bar', 'mousedown', function (e) {
                var tgt = $(e.currentTarget), div = tgt.next();
                if (div.css('display') === 'none') {
                    div.stop().slideDown(200, function () { $(this).css('display', 'block'); });
                    tgt.children('.ico').text('-');
                } else {
                    div.stop().slideUp(200, function () { $(this).css('display', 'none'); });
                    tgt.children('.ico').text('+');
                }
            }).delegate('a.opt', 'mousedown', function (e) {
                var tgt = $(e.currentTarget);
                if (tgt.hasClass('checked')) tgt.removeClass('checked'); else tgt.addClass('checked');
            });
        },
        data: {
            sortData: function (list) {
                return list.sort(function (a, b) {
                    return a.sort > b.sort ? 1 : a.sort < b.sort ? -1 : 0;
                });
            },
            getState: function (rowElt) {
                var state = parseInt(rowElt.attr('data-state'));
                if (isNaN(state)) state = 100;
                return state;
            },
            getRowElt: function (child) {
                return child.parents('tr[data-pkey-name]:first');
            },
            getRowEltByData: function (body, item) {
                switch (parseInt(item.state)) {
                    case 1:
                        return body.children('tr[data-pkey="' + item.cid + '"]').first();
                    default:
                        return body.children('tr[data-pkey="' + item.id + '"]').first();
                }
            },
            getPKeyName: function (rowElt) {
                return rowElt.attr('data-pkey-name');
            },
            getPKey: function (rowElt) {
                return rowElt.attr('data-pkey');
            },
            row: function (rowElt) {
                var state = this.getState(rowElt);
                if (state === 100) return false;
                var item = { state: state, data: {} }, data = item.data, hasError = false;
                switch (state) {
                    case 0: case 1:
                        var tr = rowElt.hasClass('group') ? rowElt.find('.row:first') : rowElt;
                        var cs = tr.find('[data-name]');
                        cs.each(function () {
                            var t = $(this), name = t.attr('data-name'), r = {};
                            if (fn.input.test(t, r, 'val')) {
                                data[name] = r.val;
                            } else {
                                hasError = true
                            };
                        });
                        data.sort = this.get_sort(rowElt)
                        break;
                }
                if (hasError) return false;
                data[rowElt.attr('data-pkey-name')] = rowElt.attr('data-pkey');
                return item;
            },
            setRow: function (tr, data) {
                tr.attr('data-pkey', data[this.getPKeyName(tr)]);
                tr.attr('data-sort', data.sort).attr('data-oldSort', data.sort);
                var val;
                if (tr.hasClass('group')) {
                    tr.find('.row:first [data-name]').each(function () {
                        var t = $(this), name = t.attr('data-name'), val;
                        if (name && typeof (val = data[name]) !== 'function') {
                            t.data('data-old', val).val(val);
                        }
                    });
                } else {
                    tr.find('[data-name]').each(function () {
                        var t = $(this), name = t.attr('data-name'), val;
                        if (name && typeof (val = data[name]) !== 'function') {
                            t.data('data-old', val).val(val);
                        }
                    });
                }
            },
            addRow: function (body, rowHtml, data, is_new) {
                body.append(rowHtml);
                var tr = body.children().last(), state = is_new ? 1 : 100;
                if (is_new) data.sort = body.children().size();
                if (state === 1) tr.addClass('change');
                tr.attr('data-state', state);
                tr.find('.state:first').text(res.data_state[state]);
                this.setRow(tr, data, is_new);
                return tr;
            },
            can_restore: function (rowElt, can) {
                var btn = rowElt.find('a[data-fun="restore"]');
                if (can) btn.removeClass('disabled'); else btn.addClass('disabled');
            },
            restore: function (rowElt) {
                rowElt.find('[data-name]').val(function () {
                    return $(this).data('data-old');
                });
                rowElt.attr('data-state', 100);
                rowElt.removeClass('delete');
                this.onchange(rowElt);
            },
            onchange: function (rowElt) {
                var state = this.getState(rowElt);
                if (state == -1 || state == 1) return;
                var cs = rowElt.find('[data-name]'), changed = false, sort_changed = false;
                cs.each(function () {
                    var t = $(this), name = t.attr('data-name'), r = {};
                    if (fn.input.test(t, r, 'val')) {
                        if (t.data('data-old') !== r.val) { changed = true; return false; }
                    } else {
                        changed = true; return false;
                    }
                });
                if (this.get_oldSort(rowElt) !== this.get_sort(rowElt)) sort_changed = true;
                state = (changed || sort_changed) ? 0 : 100;
                if (changed) {
                    this.can_restore(rowElt, true);
                } else {
                    this.can_restore(rowElt, false);
                }
                if (state === 100) {
                    rowElt.removeClass('change');
                } else {
                    rowElt.addClass('change');
                }
                rowElt.attr('data-state', state);
                rowElt.find('td.state').text(res.data_state[state]);
            },
            remove: function (rowElt) {
                if (rowElt.attr('data-state') === '1') {
                    rowElt.remove();
                } else {
                    rowElt.attr('data-state', -1);
                    rowElt.addClass('delete');
                    this.ondelete(rowElt);
                }
            },
            ondelete: function (rowElt) {
                rowElt.attr('data-state', -1);
                rowElt.find('td.state').text(res.data_state['-1']);
                rowElt.addClass('delete');
                this.can_restore(rowElt, true);
            },
            onsave: function (rowElt, item) {
                if (!item.result) return;
                // 承认记录行的当前状态
                var state = this.getState(rowElt);
                switch (state) {
                    case -1:
                        rowElt.remove();
                        break;
                    case 0: case 1:
                        rowElt.attr('data-pkey', item.id).attr('data-state', 100).attr('data-oldSort', rowElt.attr('data-sort'));
                        rowElt.find('td.state').text(res.data_state['100']);
                        rowElt.removeClass('delete change');
                        rowElt.find('[data-name]').each(function () {
                            var t = $(this), r = {};
                            if (fn.input.test(t, r, 'val')) { t.data('data-old', r.val); }
                        });
                        this.can_restore(rowElt, false);
                }
            },
            get_sort: function (rowElt) {
                return parseInt(rowElt.attr('data-sort')) || 0;
            },
            get_oldSort: function (rowElt) {
                return parseInt(rowElt.attr('data-oldSort')) || 0;
            },
            set_sort: function (rowElt, sort) {
                rowElt.attr('data-sort', sort);
                this.onchange(rowElt);
            },
            add_sort: function (rowElt, add) {
                // 获取当前序号
                if (!add) return;
                var fun, mf, plus;
                if (add > 0) {
                    fun = 'next';
                    mf = 'after';
                    plus = -1;
                } else {
                    mf = 'before';
                    fun = 'prev';
                    plus = 1;
                }
                var last_sort, next, temp;
                next = rowElt[fun]();
                if (next.size() === 0) return;
                last_sort = this.get_sort(next);
                this.set_sort(next, last_sort + plus);
                add = Math.abs(add);
                for (var i = 1; i < add; i++) {
                    temp = next[fun]();
                    if (temp.size() === 0) break;
                    next = temp;
                    last_sort = this.get_sort(next);
                    this.set_sort(next, last_sort + plus);
                }
                rowElt.detach();
                next[mf](rowElt);
                this.set_sort(rowElt, last_sort);
            }
        },
        peijian: {
            dict: {
                data: [],
                listToDict: function (list) {
                    var d = {}, arr = [];
                    $.each(list, function (d, dict) {
                        var cc = dict.find(this.define_id);
                        var cls = d[cc.cls.id];
                        if (!cls) {
                            cls = { id: cc.cls.id, name: cc.cls.name };
                            arr.push(cls);
                            d[cc.cls.id] = cls;
                        }
                        if (!cls.list) {
                            cls.list = [];
                        }
                        cls.list.push(this);
                        this.name = cc.child.name;
                    }, [d, this]);
                    return arr;
                },
                find: function (childKey) {
                    /// <summary>返回 {cls,child}</summary>
                    var r = { cls: null, child: null };
                    $.each(this.data, function (r, childKey) {
                        $.each(this.list, function (r, childKey) {
                            if (this.id == childKey) {
                                r.child = this;
                                return false;
                            }
                        }, [r, childKey]);
                        if (r.child) {
                            r.cls = this;
                            return false;
                        }
                    }, [r, childKey]);
                    return r;
                },
                load: function () {
                    win_begin_wait();
                    ajaxJson('peijian_dict.php', function (return_data) {
                        this.data = return_data.classs;
                        var ds = {};
                        return_data.classs = fn.data.sortData(return_data.classs);
                        return_data.list = fn.data.sortData(return_data.list);
                        $.each(return_data.classs, function (ds) {
                            ds[this.id] = this;
                            this.list = [];
                        }, [ds]);
                        $.each(return_data.list, function (ds) {
                            ds[this['class']].list.push(this);
                        }, [ds]);
                    }, {
                        type: 'GET',
                        dataType: 'json',
                        data: { act: 'list' },
                        complete: win_end_wait,
                        context: this
                    });
                }
            },
            pinpai_lib: {
                data: {},
                dict_data: {},
                load: function (pinpai_id, callback, context) {
                    win_begin_wait();
                    ajaxJson('peijian.php', function (return_data) {
                        this.thisObj.data[this.pinpai_id] = return_data;
                        var dict_data = this.thisObj.dict_data[this.pinpai_id] = fn.peijian.dict.listToDict(return_data);
                        if (this.callback) {
                            if (this.context) { this.callback.call(this.context, return_data, dict_data); } else { this.callback(return_data, dict_data); }
                        }
                    }, {
                        context: { thisObj: this, callback: callback, context: context, pinpai_id: pinpai_id },
                        data: { act: 'list', pinpai_id: pinpai_id },
                        type: 'GET',
                        complete: win_end_wait
                    });
                },
                find: function (pinpai_id, id) {
                    var r = {};
                    $.each(this.data[pinpai_id], function (r, id) {
                        if (this.id == id) {
                            r.v = this;
                            return false;
                        }
                    }, [r, id]);
                    return r.v;
                }
            }
        },
        fenlei: {
            current: function (name) {
                return parseInt(fn.selectButton.val(this.elt().find('a.btn.sel[data-fun="' + name + '"]:first')));
            },
            selectDlg: function ($btn, list) {
                fn.selectButton.dlg($btn, '', list, 'id', 'name');
            },
            guobie: {
                data: [],
                current: function () {
                    return fn.fenlei.current.call(this, 'guobie-sel');
                },
                load: function (callback, context) {
                    win_begin_wait();
                    var opts = {
                        type: 'GET',
                        complete: win_end_wait,
                        data: {
                            act: 'list'
                        }
                    };
                    opts.context = { thisObj: this, context: context, callback: callback };
                    ajaxJson('guobie.php', function (list) {
                        list = fn.data.sortData(list);
                        this.thisObj.data = list;
                        if (typeof (this.callback) === 'function') {
                            if (this.context) {
                                this.callback.call(this.context, list);
                            } else {
                                this.callback(list);
                            }
                        }
                    }, opts);
                }
            },
            pinpai: {
                current: function () {
                    return fn.fenlei.current.call(this, 'pinpai-sel');
                },
                data: {},
                load: function (pid, callback, context) {
                    win_begin_wait();
                    var opts = {
                        type: 'GET',
                        complete: win_end_wait,
                        data: {
                            act: 'list',
                            pid: pid
                        }
                    };
                    opts.context = { thisObj: this, context: context, callback: callback };
                    ajaxJson('pinpai.php', function (list) {
                        list = fn.data.sortData(list);
                        this.thisObj.data[pid] = list;
                        if (typeof (this.callback) === 'function') {
                            if (this.context) {
                                this.callback.call(this.context, list);
                            } else {
                                this.callback(list);
                            }
                        }
                    }, opts);
                }
            },
            xilie: {
                current: function () {
                    return fn.fenlei.current.call(this, 'xilie-sel');
                },
                data: {},
                load: function (pid, callback, context) {
                    win_begin_wait();
                    var opts = {
                        type: 'GET',
                        complete: win_end_wait,
                        data: {
                            act: 'list',
                            pid: pid
                        }
                    };
                    opts.context = { thisObj: this, context: context, callback: callback };
                    ajaxJson('xilie.php', function (list) {
                        list = fn.data.sortData(list);
                        this.thisObj.data[pid] = list;
                        if (typeof (this.callback) === 'function') {
                            if (this.context) {
                                this.callback.call(this.context, list);
                            } else {
                                this.callback(list);
                            }
                        }
                    }, opts);
                }
            },
            chexin: {
                data: {},
                load: function (pid, callback, context) {
                    win_begin_wait();
                    var opts = {
                        type: 'GET',
                        complete: win_end_wait,
                        data: {
                            act: 'list',
                            pid: pid
                        }
                    };
                    opts.context = { thisObj: this, context: context, callback: callback };
                    ajaxJson('chexin.php', function (list) {
                        list = fn.data.sortData(list);
                        this.thisObj.data[pid] = list;
                        if (typeof (this.callback) === 'function') {
                            if (this.context) {
                                this.callback.call(this.context, list);
                            } else {
                                this.callback(list);
                            }
                        }
                    }, opts);
                }
            }
        }
    };
    var pageDict = {
        car_fenlei_m: fn.page.expand('汽车分类管理', 'car_fenlei_m', {
            init: function () {
                if (this.base('init')) return true;
                var page_elt = this.elt();
                page_elt.delegate('a[data-fun]:not(.disabled)', 'click', this, function (e) {
                    var tgt = $(e.currentTarget);
                    var page = e.data;
                    switch (tgt.attr('data-fun')) {
                        case 'guobie-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.guobie.data);
                            break;
                        case 'guobie-add':
                            page.guobie_add({ id: unique('new'), name: '新国别请修改名称', sort: 0 }, true);
                            break;
                        case 'guobie-save':
                            page.guobie_save();
                            break;
                        case 'pinpai-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.pinpai.data[page.guobie_current()]);
                            break;
                        case 'pinpai-add':
                            page.pinpai_add({
                                id: unique('new'), name: '新品牌请修改名称', code: '',
                                series_code_pos: 0, series_code_len: 0,
                                bodywork_code_pos: 0, bodywork_code_len: 0,
                                sc_code_pos: 0, sc_code_len: 0,
                                egnum_code_pos: 0, egnum_code_len: 0,
                                trnum_code_pos: 0, trnum_code_len: 0
                            }, true);
                            break;
                        case 'pinpai-save':
                            page.pinpai_save();
                            break;
                        case 'xilie-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.xilie.data[page.pinpai_current()]);
                            break;
                        case 'xilie-add':
                            page.xilie_add({ id: unique('new'), name: '新系列请修改名称', code: 'xxx' }, true);
                            break;
                        case 'xilie-save':
                            page.xilie_save();
                            break;
                        case 'chexin-add':
                            page.chexin_add({ id: unique('new'), name: '新车型请修改名称', code: 'xxx' }, true);
                            break;
                        case 'chexin-save':
                            page.chexin_save();
                            break;
                        case 'sort-up':
                            fn.data.add_sort(fn.data.getRowElt(tgt), -1);
                            break;
                        case 'sort-down':
                            fn.data.add_sort(fn.data.getRowElt(tgt), 1);
                            break;
                        case 'restore':
                            fn.data.restore(fn.data.getRowElt(tgt));
                            break;
                        case 'delete':
                            fn.data.remove(fn.data.getRowElt(tgt));
                            break;
                    }
                }).change(this, function (e) {
                    var rowElt = $(e.target).parents('tr[data-state]:first');
                    fn.data.onchange(rowElt);
                });
                page_elt.find('.fenlei-sel').delegate('a.btn.sel', '_change', this, function (e, data) {
                    var a = $(e.currentTarget), na, page_elt = e.data.elt();
                    switch (a.attr('data-fun')) {
                        case 'guobie-sel':
                            if (e.data.pinpai_save(true)) {
                                fn.selectButton.reset(a, data.value, data.text);
                                alert('[品牌管理]页数据未保存！！');
                                return;
                            }
                            na = $(e.delegateTarget).find('a[data-fun="pinpai-sel"]:first');
                            var selected = fn.selectButton.val(a);
                            fn.disable(na, !selected);
                            var tabLink = page_elt.find('div.tab>a.pinpai:first');
                            fn.disable(tabLink, !selected);
                            e.data.pinpai_load_list();
                            if (selected) {
                                tabLink.trigger('_active');
                            }
                            fn.selectButton.val(na, '');
                            break;
                        case 'pinpai-sel':
                            na = $(e.delegateTarget).find('a[data-fun="xilie-sel"]:first');
                            var selected = fn.selectButton.val(a);
                            fn.disable(na, !selected);
                            var tabLink = page_elt.find('div.tab>a.xilie:first');
                            fn.disable(tabLink, !selected);
                            e.data.xilie_load_list();
                            if (selected) {
                                tabLink.trigger('_active');
                            }
                            fn.selectButton.val(na, '');
                            break;
                        case 'xilie-sel':
                            var selected = fn.selectButton.val(a);
                            var tabLink = page_elt.find('div.tab>a.chexin:first');
                            fn.disable(tabLink, !selected);
                            e.data.chexin_load_list();
                            if (selected) {
                                tabLink.trigger('_active');
                            }
                            break;
                    }
                });
                page_elt.find('div.tab').delegate('a:not(.disabled)', '_active', fn.tab.on_active).delegate('a:not(.disabled)', 'mousedown', function (e) {
                    $(e.currentTarget).trigger('_active');
                });
                this.guobie_load_list();
                return false;
            },
            guobie_add: function (data, is_new) {
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.guobie tbody');
                fn.data.addRow(body, fn.htmlRes.get("guobie-row"), data, is_new);
            },
            guobie_save: function (is_test) {
                // 收集数据
                if (!is_test) win_begin_wait();
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.guobie tbody');
                var cs = body.children(), list = [];
                cs.each(function () {
                    var elt = $(this);
                    var item = fn.data.row(elt, true);
                    if (item) list.push(item);
                });
                if (list.length === 0) {
                    if (!is_test) win_end_wait();
                    return false;
                }
                if (is_test) return true;
                ajaxJson('guobie.php', function (return_list) {
                    var count = return_list.length, item, elt = this.elt(), body = elt.find('div.tab-panel>div.guobie tbody');
                    for (var i = 0; i < count; i++) {
                        item = return_list[i];
                        fn.data.onsave(fn.data.getRowEltByData(body, item), item);
                    }
                    fn.fenlei.guobie.load();
                }, {
                    context: this,
                    type: 'POST',
                    data: {
                        act: 'save',
                        data: JSON.stringify(list)
                    },
                    complete: win_end_wait
                });
            },
            guobie_load_list: function () {
                fn.fenlei.guobie.load(function (list) {
                    var count = list.length, item;
                    for (var i = 0; i < count; i++) {
                        item = list[i];
                        this.guobie_add(item, false);
                    }
                }, this);
            },
            guobie_current: fn.fenlei.guobie.current,
            pinpai_load_list: function () {
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.pinpai tbody');
                body.html('');
                var pid = this.guobie_current();
                if (!pid) return;
                fn.fenlei.pinpai.load(pid, function (list) {
                    var count = list.length, item;
                    for (var i = 0; i < count; i++) {
                        item = list[i];
                        this.pinpai_add(item, false);
                    }
                }, this);
            },
            pinpai_add: function (data, is_new) {
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.pinpai tbody');
                fn.data.addRow(body, fn.htmlRes.get("pinpai-row"), data, is_new);
            },
            pinpai_save: function (is_test) {
                if (!is_test) win_begin_wait();
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.pinpai tbody');
                var cs = body.children(), list = [];
                var pid = this.guobie_current();
                if (!pid) {
                    if (!is_test) win_end_wait();
                    return false;
                }
                cs.each(function () {
                    var elt = $(this);
                    var item = fn.data.row(elt);
                    if (item) {
                        list.push(item);
                        item.data.pid = pid;
                    }
                });
                if (list.length === 0) {
                    if (!is_test) win_end_wait();
                    return false;
                }
                if (is_test) return true;
                ajaxJson('pinpai.php', function (return_list) {
                    var count = return_list.length, item, elt = this.elt(), body = elt.find('div.tab-panel>div.pinpai tbody');
                    for (var i = 0; i < count; i++) {
                        item = return_list[i];
                        fn.data.onsave(fn.data.getRowEltByData(body, item), item);
                    }
                    fn.fenlei.pinpai.load(pid);
                }, {
                    context: this,
                    type: 'POST',
                    data: {
                        act: 'save',
                        data: JSON.stringify(list)
                    },
                    complete: win_end_wait
                });
            },
            pinpai_current: fn.fenlei.pinpai.current,
            xilie_add: function (data, is_new) {
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.xilie tbody');
                fn.data.addRow(body, fn.htmlRes.get("xilie-row"), data, is_new);
            },
            xilie_load_list: function () {
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.xilie tbody');
                body.html('');
                var pid = this.pinpai_current();
                if (!pid) return;
                fn.fenlei.xilie.load(pid, function (list) {
                    var count = list.length, item;
                    for (var i = 0; i < count; i++) {
                        item = list[i];
                        this.xilie_add(item, false);
                    }
                }, this);
            },
            xilie_save: function () {
                win_begin_wait();
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.xilie tbody');
                var cs = body.children(), list = [];
                var pid = this.pinpai_current();
                if (!pid) {
                    win_end_wait();
                    return;
                }
                cs.each(function () {
                    var elt = $(this);
                    var item = fn.data.row(elt, true);
                    if (item) {
                        list.push(item);
                        item.data.pid = pid;
                    }
                });
                if (list.length === 0) {
                    win_end_wait();
                    return;
                }
                ajaxJson('xilie.php', function (return_list) {
                    var count = return_list.length, item, elt = this.elt(), body = elt.find('div.tab-panel>div.xilie tbody'), rowElt;
                    for (var i = 0; i < count; i++) {
                        item = return_list[i];
                        fn.data.onsave(fn.data.getRowEltByData(body, item), item);
                    }
                    fn.fenlei.xilie.load(pid);
                }, {
                    context: this,
                    type: 'POST',
                    data: {
                        act: 'save',
                        data: JSON.stringify(list)
                    },
                    complete: win_end_wait
                });
            },
            xilie_current: fn.fenlei.xilie.current,
            chexin_add: function (data, is_new) {
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.chexin tbody');
                fn.data.addRow(body, fn.htmlRes.get("chexin-row"), data, is_new);
            },
            chexin_load_list: function () {
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.chexin tbody');
                body.html('');
                var pid = this.xilie_current();
                if (!pid) return;
                fn.fenlei.chexin.load(pid, function (list) {
                    var count = list.length, item;
                    for (var i = 0; i < count; i++) {
                        item = list[i];
                        this.chexin_add(item, false);
                    }
                }, this);
            },
            chexin_save: function () {
                win_begin_wait();
                var elt = this.elt();
                var body = elt.find('div.tab-panel>div.chexin tbody');
                var cs = body.children(), list = [];
                var pid = this.xilie_current();
                if (!pid) {
                    win_end_wait();
                    return;
                }
                cs.each(function () {
                    var elt = $(this);
                    var item = fn.data.row(elt, true);
                    if (item) {
                        list.push(item);
                        item.data.pid = pid;
                    }
                });
                if (list.length === 0) {
                    win_end_wait();
                    return;
                }
                ajaxJson('chexin.php', function (return_list) {
                    var count = return_list.length, item, elt = this.elt(), body = elt.find('div.tab-panel>div.chexin tbody'), rowElt;
                    for (var i = 0; i < count; i++) {
                        item = return_list[i];
                        fn.data.onsave(fn.data.getRowEltByData(body, item), item);
                    }
                    fn.fenlei.xilie.load(pid);
                }, {
                    context: this,
                    type: 'POST',
                    data: {
                        act: 'save',
                        data: JSON.stringify(list)
                    },
                    complete: win_end_wait
                });
            }
        }),
        vin_m: fn.page.expand('车架号VIN管理', 'vin_m', {
            init: function () {
                if (this.base('init')) return true;
                var page_elt = this.elt();
                page_elt.delegate('a:not(.disabled)', 'click', this, function (e) {
                    var tgt = $(e.currentTarget);
                    var page = e.data;
                    switch (tgt.attr('data-fun')) {
                        case 'guobie-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.guobie.data);
                            break;
                        case 'pinpai-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.pinpai.data[page.guobie_current()]);
                            break;
                        case 'add':
                            var uid = unique();
                            page.add(tgt.parents('[data-field]:first').attr('data-field'), { id: 'new' + uid, code: '', value: '', sort: 0 }, true);
                            break;
                        case 'save':
                            page.save(tgt.parents('[data-field]:first').attr('data-field'));
                            break;
                        case 'sort-up':
                            fn.data.add_sort(fn.data.getRowElt(tgt), -1);
                            break;
                        case 'sort-down':
                            fn.data.add_sort(fn.data.getRowElt(tgt), 1);
                            break;
                        case 'restore':
                            fn.data.restore(fn.data.getRowElt(tgt));
                            break;
                        case 'delete':
                            fn.data.remove(fn.data.getRowElt(tgt));
                            break;
                    }
                }).change(this, function (e) {
                    var rowElt = $(e.target).parents('tr[data-state]:first');
                    fn.data.onchange(rowElt);
                });
                page_elt.find('.fenlei-sel').delegate('a.btn.sel', '_change', this, function (e, data) {
                    var a = $(e.currentTarget);
                    switch (a.attr('data-fun')) {
                        case 'guobie-sel':
                            na = $(e.delegateTarget).find('a[data-fun="pinpai-sel"]:first');
                            var selected = fn.selectButton.val(a);
                            fn.disable(na, !selected);
                            fn.selectButton.val(na, '');
                            if (selected) {
                                fn.fenlei.pinpai.load(parseInt(selected));
                            }
                            break;
                        case 'pinpai-sel':
                            var selected = fn.selectButton.val(a);
                            var b1 = $(e.delegateTarget).parents('div.page:first').children('div.b1:first');
                            if (selected) {
                                b1.stop().fadeIn(300);
                                e.data.list();
                            } else {
                                b1.stop().fadeOut(300);
                            }
                            break;
                    }
                });
                page_elt.find('div.tab').delegate('a:not(.disabled)', '_active', fn.tab.on_active).delegate('a:not(.disabled)', 'mousedown', function (e) {
                    $(e.currentTarget).trigger('_active');
                });
                return false;
            },
            guobie_current: fn.fenlei.guobie.current,
            pinpai_current: fn.fenlei.pinpai.current,
            add: function (filed, data, is_new) {
                var body = this.elt().find('div.b1:first>div.tab-panel>div[data-field="' + filed + '"] tbody:first');
                var tr = fn.data.addRow(body, fn.htmlRes.get("vin-row"), data, is_new);
                if (filed == 'pofp') tr.find('[data-name="code"]:first').attr('maxlength', 1);
            },
            list: function () {
                var bodys = this.elt().find('div.b1:first>div.tab-panel>div[data-field] tbody');
                bodys.each(function () {
                    $(this).html('');
                });
                var pinpai_id = this.pinpai_current();
                if (!pinpai_id) return;
                win_begin_wait();
                var opts = {
                    type: 'GET',
                    complete: win_end_wait,
                    data: {
                        act: 'list',
                        pinpai_id: pinpai_id
                    },
                    context: this
                };
                ajaxJson('vin.php', function (list) {
                    var data = {
                        year: [], bodywork: [], sc: [], egnum: [], trnum: [], oass: [], batch: [], pofp: []
                    };
                    $.each(list, function (data) {
                        data[this.field].push(this);
                    }, [data]);
                    var elt = this.elt();
                    elt.find('div.tab-panel>div[data-field]').each(function (page, data) {
                        var div = $(this), field = div.attr('data-field'), list = fn.data.sortData(data[field] || []);
                        var body = div.find('tbody:first');
                        body.html('');
                        $.each(list, function (page, field) {
                            page.add(field, this, false);
                        }, [page, field]);
                    }, [this, data]);
                }, opts);
            },
            save: function (field, is_test) {
                var elt = this.elt();
                var body = elt.find('div.tab-panel:first>div[data-field=' + field + '] tbody:first');
                if (!body.size()) return false;
                var cs = body.children(), list = [];
                var pinpai_id = this.pinpai_current();
                if (!pinpai_id) return false;
                cs.each(function () {
                    var elt = $(this);
                    var item = fn.data.row(elt, true);
                    if (item) {
                        list.push(item);
                        item.data.pinpai_id = pinpai_id;
                        item.data.field = field;
                    }
                });
                if (list.length === 0) return false;
                if (is_test) return true;
                win_begin_wait();
                ajaxJson('vin.php', function (return_list) {
                    var count = return_list.length, item, elt = this.page.elt(), body = elt.find('div.tab-panel>div[data-field="' + this.field + '"] tbody:first'), rowElt;
                    for (var i = 0; i < count; i++) {
                        item = return_list[i];
                        fn.data.onsave(fn.data.getRowEltByData(body, item), item);
                    }
                }, {
                    context: { page: this, field: field },
                    type: 'POST',
                    data: {
                        act: 'save',
                        data: JSON.stringify(list)
                    },
                    complete: win_end_wait
                });
            }
        }),
        peijian_dict_m: fn.page.expand('配件字典库管理', 'peijian_dict_m', {
            init: function () {
                if (this.base('init')) return true;
                var page_elt = this.elt();
                page_elt.delegate('a[data-fun]:not(.disabled)', 'click', this, function (e) {
                    var tgt = $(e.currentTarget);
                    switch (tgt.attr('data-fun')) {
                        case 'hide':
                            tgt.parents('div.row:first').next().hide();
                            tgt.text('显示列表');
                            tgt.attr('data-fun', 'show');
                            break;
                        case 'show':
                            tgt.parents('div.row:first').next().show();
                            tgt.text('隐藏列表');
                            tgt.attr('data-fun', 'hide');
                            break;
                        case 'hide-all':
                            tgt.parents('tbody:first').find('a[data-fun="hide"]').each(function () {
                                var tgt = $(this);
                                tgt.parents('div.row:first').next().hide();
                                tgt.text('显示列表');
                                tgt.attr('data-fun', 'show');
                            });
                            break;
                        case 'show-all':
                            tgt.parents('tbody:first').find('a[data-fun="show"]').each(function () {
                                var tgt = $(this);
                                tgt.parents('div.row:first').next().show();
                                tgt.text('隐藏列表');
                                tgt.attr('data-fun', 'hide');
                            });
                            break;
                        case 'add-class':
                            e.data.add_class({ id: unique('new_class'), name: '新类别', sort: 0 }, true);
                            break;
                        case 'add':
                            e.data.add(tgt.parents('tr:first').find('table.list:first>tbody'), { id: unique('new_peijian'), name: '新配件', desc: '', sort: 0 }, true);
                            break;
                        case 'sort-up':
                            fn.data.add_sort(fn.data.getRowElt(tgt), -1);
                            break;
                        case 'sort-down':
                            fn.data.add_sort(fn.data.getRowElt(tgt), 1);
                            break;
                        case 'restore':
                            fn.data.restore(fn.data.getRowElt(tgt));
                            break;
                        case 'delete':
                            fn.data.remove(fn.data.getRowElt(tgt));
                            break;
                        case 'save':
                            e.data.save();
                            break;
                    }
                }).change(this, function (e) {
                    fn.data.onchange(fn.data.getRowElt($(e.target)));
                });
                $.each(fn.peijian.dict.data, function (page) {
                    var tr = page.add_class(this, false);
                    $.each(this.list, function (page, body) {
                        page.add(body, this, false);
                    }, [page, tr.find('tbody:first')]);
                }, [this]);
                return false;
            },
            add_class: function (data, is_new) {
                return fn.data.addRow(this.elt().find('div.b1>table>tbody:first'), fn.htmlRes.get('peijian-class-row'), data, is_new);
            },
            add: function (classBody, data, is_new) {
                return fn.data.addRow(classBody, fn.htmlRes.get('peijian-dict-row'), data, is_new);
            },
            save: function (is_test) {
                // 提取数据
                var elt = this.elt();
                var classBody = elt.find('div.b1:first>table>tbody'), data = [], hasData = false;
                classBody.children().each(function (data) {
                    var rowElt = $(this), item = fn.data.row(rowElt), changed = false;
                    if (!item) {
                        item = { data: {} };
                        item.data[fn.data.getPKeyName(rowElt)] = fn.data.getPKey(rowElt);
                    } else changed = true;
                    rowElt.find('table:first>tbody').children().each(function (list) {
                        var rowElt = $(this), item = fn.data.row(rowElt);
                        if (item) list.push(item);
                    }, [item.list = []]);
                    if (item.list.length > 0) changed = true;
                    if (changed) {
                        data.push(item);
                    }
                }, [data]);
                if (data.length == 0) return false;
                if (is_test) return true;
                win_begin_wait();
                ajaxJson('peijian_dict.php', function (return_list) {
                    fn.peijian.dict.load();
                    var elt = this.elt(), classBody = elt.find('div.b1:first>table>tbody');
                    $.each(return_list, function (classBody) {
                        var rowElt = fn.data.getRowEltByData(classBody, this);
                        fn.data.onsave(rowElt, this);
                        $.each(this.list, function (body) {
                            fn.data.onsave(fn.data.getRowEltByData(body, this), this);
                        }, [rowElt.find('tbody:first')]);
                    }, [classBody]);
                }, {
                    context: this,
                    type: 'POST',
                    data: {
                        act: 'save',
                        data: JSON.stringify(data)
                    },
                    complete: win_end_wait
                });
            }
        }),
        pinpai_peijian_m: fn.page.expand('品牌配件库管理', 'pinpai_peijian_m', {
            init: function () {
                if (this.base('init')) return true;
                var page_elt = this.elt();
                page_elt.delegate('a[data-fun]:not(.disabled)', 'click', this, function (e) {
                    var tgt = $(e.currentTarget), page = e.data;
                    switch (tgt.attr('data-fun')) {
                        case 'add':
                            fn.multiSelectDialog('', fn.peijian.dict.data, {}, { group_key: 'id', group_text: function (group) { return group.name; }, list_key: 'list', child_key: 'id', child_text: 'name' }, function (data) {
                                $.each(data, function (page) {
                                    $.each(this.list, function (page) {
                                        page.add({ id: unique('peijian'), define_id: this, code: '', price_4s: 0, price_of: 0, price_df: 0, price_chop: 0, price_repair: 0 }, true);
                                    }, [page]);
                                }, [page]);
                            }, this);
                            break;
                        case 'hide':
                            tgt.parents('tbody').next('tbody').hide(0);
                            tgt.attr('data-fun', 'show').text('显示列表');
                            break;
                        case 'save':
                            page.save();
                            break;
                        case 'show':
                            tgt.parents('tbody').next('tbody').slideDown(500);
                            tgt.attr('data-fun', 'hide').text('隐藏列表');
                            break;
                        case 'guobie-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.guobie.data);
                            break;
                        case 'pinpai-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.pinpai.data[page.guobie_current()]);
                            break;
                        case 'sort-up':
                            fn.data.add_sort(fn.data.getRowElt(tgt), -1);
                            break;
                        case 'sort-down':
                            fn.data.add_sort(fn.data.getRowElt(tgt), 1);
                            break;
                        case 'restore':
                            fn.data.restore(fn.data.getRowElt(tgt));
                            break;
                        case 'delete':
                            fn.data.remove(fn.data.getRowElt(tgt));
                            break;
                    }
                }).change(this, function (e) {
                    fn.data.onchange(fn.data.getRowElt($(e.target)));
                });
                page_elt.find('.fenlei-sel').delegate('a.btn.sel', '_change', this, function (e, data) {
                    var a = $(e.currentTarget), page = e.data;
                    switch (a.attr('data-fun')) {
                        case 'guobie-sel':
                            na = $(e.delegateTarget).find('a[data-fun="pinpai-sel"]:first');
                            var selected = fn.selectButton.val(a);
                            fn.disable(na, !selected);
                            fn.selectButton.val(na, '');
                            if (selected) {
                                fn.fenlei.pinpai.load(parseInt(selected));
                            }
                            break;
                        case 'pinpai-sel':
                            var selected = fn.selectButton.val(a);
                            var b1 = $(e.delegateTarget).parents('div.page:first').children('div.b1:first');
                            if (selected) {
                                b1.stop().fadeIn(300);
                                page.load();
                            } else {
                                b1.stop().fadeOut(300);
                            }
                            break;
                    }
                });
                return false;
            },
            guobie_current: fn.fenlei.guobie.current,
            pinpai_current: fn.fenlei.pinpai.current,
            add_class: function (cls) {
                var table = this.elt().find('div.b1:first table:first'), tbody = table.find('tbody.group-header[data-pkey="' + cls.id + '"]:first');
                if (tbody.size() > 0) return tbody;
                table.append('<tbody class="group-header"></tbody><tbody class="group-list">');
                tbody = table.children('tbody.group-header').last();
                tbody.append(fn.htmlRes.get('pinpai-peijian-class-row'));
                tbody.data('sort', cls.sort);
                table.children('tbody.group-header').each(function (header_body, list_body, sort) {
                    var t = $(this);
                    if (sort < t.data('sort')) {
                        t.before(header_body);
                        t.before(list_body);
                        return false;
                    }
                }, [tbody, tbody.next('tbody'), cls.sort]);
                tr = tbody.children('tr').last();
                tr.find('span[data-label="class"]:first').text(cls.name);
                tbody.attr('data-pkey', cls.id);
                var pinpai_id = this.pinpai_current();
                tr.find('iframe.upload:first').attr('src', 'upload-pic.php?type=pinpai&id=' + pinpai_id + '&cid=' + cls.id);
                return tbody;
            },
            add_to: function (cls, define, data, is_new) {
                var cls_body = this.add_class(cls), body = cls_body.next('tbody');
                var tr = fn.data.addRow(body, fn.htmlRes.get('pinpai-peijian-row'), data, is_new);
                tr.data('sort', define.sort);
                body.children('tr').each(function (tr, sort) {
                    var t = $(this);
                    if (sort < t.data('sort')) {
                        t.before(tr);
                    }
                }, [tr, define.sort]);
                tr.find('td.name:first').text(define.name);
                tr.data('define_id', define.id);
                return tr;
            },
            add: function (data, is_new) {
                var define_id = data.define_id;
                var cc = fn.peijian.dict.find(define_id);
                return this.add_to(cc.cls, cc.child, data, is_new);
            },
            load: function () {
                var pinpai_id = this.pinpai_current();
                this.elt().find('div.b1:first>table>tbody').remove();
                fn.peijian.pinpai_lib.load(pinpai_id, function (list) {
                    $.each(list, function (page) {
                        page.add(this, false);
                    }, [this]);
                }, this);
            },
            save: function (is_test) {
                var data = [];
                var table = this.elt().find('div.b1:first>table:first'), pinpai_id = this.pinpai_current();
                table.children('tbody.group-list').children().each(function (data) {
                    var tr = $(this);
                    var item = fn.data.row(tr);
                    if (!item) return;
                    item.data.define_id = tr.data('define_id');
                    data.push(item);
                }, [data]);
                if (data.length === 0) return false;
                if (is_test) return true;
                win_begin_wait();
                ajaxJson('peijian.php', function (list) {
                    var table = this.elt().find('div.b1:first>table:first');
                    $.each(list, function (table) {
                        var tr = table.children('tbody.group-list').children('tr[data-pkey="' + (this.cid || this.id) + '"]:first');
                        var body = tr.parents('tbody.group-list:first'), group_body = body.prev('tbody');
                        fn.data.onsave(tr, this);
                        if (body.children().size() == 0) {
                            body.remove();
                            group_body.remove();
                        }
                    }, [table]);
                }, {
                    context: this,
                    type: 'POST',
                    data: { act: 'save', pinpai_id: pinpai_id, data: JSON.stringify(data) },
                    complete: win_end_wait
                });
            }
        }),
        xilie_peijian_m: fn.page.expand('车系配件库管理', 'xilie_peijian_m', {
            init: function () {
                if (this.base('init')) return true;
                var page_elt = this.elt();
                page_elt.delegate('a[data-fun]:not(.disabled)', 'click', this, function (e) {
                    var tgt = $(e.currentTarget), page = e.data;
                    switch (tgt.attr('data-fun')) {
                        case 'add':
                            var pinpai_id = page.pinpai_current();
                            fn.multiSelectDialog('', fn.peijian.pinpai_lib.dict_data[pinpai_id], page.list(), { group_key: 'id', group_text: 'name', list_key: 'list', child_key: 'id', child_text: function (item) { return item.code + '-' + item.name; } }, function (data) {
                                $.each(data, function (page, pinpai_id) {
                                    $.each(this.list, function (page, pinpai_id) {
                                        var item = fn.peijian.pinpai_lib.find(pinpai_id, this);
                                        page.add(item, true);
                                    }, [page, pinpai_id]);
                                }, [page, pinpai_id]);
                            }, this);
                            break;
                        case 'hide':
                            tgt.parents('tbody').next('tbody').hide(0);
                            tgt.attr('data-fun', 'show').text('显示列表');
                            break;
                        case 'save':
                            page.save();
                            break;
                        case 'show':
                            tgt.parents('tbody').next('tbody').slideDown(500);
                            tgt.attr('data-fun', 'hide').text('隐藏列表');
                            break;
                        case 'guobie-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.guobie.data);
                            break;
                        case 'pinpai-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.pinpai.data[page.guobie_current()]);
                            break;
                        case 'xilie-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.xilie.data[page.pinpai_current()]);
                            break;
                        case 'sort-up':
                            fn.data.add_sort(fn.data.getRowElt(tgt), -1);
                            break;
                        case 'sort-down':
                            fn.data.add_sort(fn.data.getRowElt(tgt), 1);
                            break;
                        case 'restore':
                            fn.data.restore(fn.data.getRowElt(tgt));
                            break;
                        case 'delete':
                            fn.data.remove(fn.data.getRowElt(tgt));
                            break;
                    }
                }).change(this, function (e) {
                    fn.data.onchange(fn.data.getRowElt($(e.target)));
                });
                page_elt.find('.fenlei-sel').delegate('a.btn.sel', '_change', this, function (e, data) {
                    var a = $(e.currentTarget), page = e.data;
                    switch (a.attr('data-fun')) {
                        case 'guobie-sel':
                            na = $(e.delegateTarget).find('a[data-fun="pinpai-sel"]:first');
                            var selected = fn.selectButton.val(a);
                            fn.disable(na, !selected);
                            fn.selectButton.val(na, '');
                            if (selected) {
                                fn.fenlei.pinpai.load(parseInt(selected));
                            }
                            break;
                        case 'pinpai-sel':
                            na = $(e.delegateTarget).find('a[data-fun="xilie-sel"]:first');
                            var selected = fn.selectButton.val(a);
                            fn.disable(na, !selected);
                            fn.selectButton.val(na, '');
                            if (selected) {
                                selected = parseInt(selected);
                                fn.fenlei.xilie.load(parseInt(selected));
                                fn.peijian.pinpai_lib.load(selected);
                            }
                            break;
                        case 'xilie-sel':
                            var selected = fn.selectButton.val(a);
                            var b1 = $(e.delegateTarget).parents('div.page:first').children('div.b1:first');
                            if (selected) {
                                b1.stop().fadeIn(300);
                                page.load();
                            } else {
                                b1.stop().fadeOut(300);
                            }
                            break;
                    }
                });
                return false;
            },
            guobie_current: fn.fenlei.guobie.current,
            pinpai_current: fn.fenlei.pinpai.current,
            xilie_current: fn.fenlei.xilie.current,
            add_class: function (cls) {
                var table = this.elt().find('div.b1:first table:first'), tbody = table.find('tbody.group-header[data-pkey="' + cls.id + '"]:first');
                if (tbody.size() > 0) return tbody;
                table.append('<tbody class="group-header"></tbody><tbody class="group-list">');
                tbody = table.children('tbody.group-header').last();
                tbody.append(fn.htmlRes.get('pinpai-peijian-class-row'));
                tbody.data('sort', cls.sort);
                table.children('tbody.group-header').each(function (header_body, list_body, sort) {
                    var t = $(this);
                    if (sort < t.data('sort')) {
                        t.before(header_body);
                        t.before(list_body);
                        return false;
                    }
                }, [tbody, tbody.next('tbody'), cls.sort]);
                tr = tbody.children('tr').last();
                tr.find('span[data-label="class"]:first').text(cls.name);
                tbody.attr('data-pkey', cls.id);
                var pinpai_id = this.pinpai_current();
                tr.find('iframe.upload:first').attr('src', 'upload-pic.php?type=xilie&id=' + pinpai_id + '&cid=' + cls.id);
                return tbody;
            },
            add_to: function (cls, define, data, is_new) {
                var cls_body = this.add_class(cls), body = cls_body.next('tbody');
                var tr = fn.data.addRow(body, fn.htmlRes.get('pinpai-peijian-row'), data, is_new);
                tr.data('sort', define.sort);
                body.children('tr').each(function (tr, sort) {
                    var t = $(this);
                    if (sort < t.data('sort')) {
                        t.before(tr);
                    }
                }, [tr, define.sort]);
                tr.find('td.name:first').text(define.name);
                tr.data('define_id', define.id);
                return tr;
            },
            add: function (data, is_new) {
                var define_id = data.define_id;
                var cc = fn.peijian.dict.find(define_id);
                return this.add_to(cc.cls, cc.child, data, is_new);
            },
            list: function () {
                var data = [];
                var table = this.elt().find('div.b1:first>table:first');
                table.children('tbody.group-list').children().each(function (data) {
                    data.push(fn.data.getPKey($(this)));
                }, [data]);
                return data;
            },
            load: function () {
                var xilie_id = this.xilie_current();
                this.elt().find('div.b1:first>table>tbody').remove();
                win_begin_wait();
                ajaxJson('peijian.php', function (return_data) {
                    var pinpai_id = this.pinpai_current();
                    $.each(return_data, function (page) {
                        var item = fn.peijian.pinpai_lib.find(pinpai_id, this);
                        page.add(item, false);
                    }, [this]);
                }, {
                    context: this,
                    data: { act: 'list-xilie', xilie_id: xilie_id },
                    type: 'GET',
                    complete: win_end_wait
                });
            },
            save: function (is_test) {
                var data = [];
                var table = this.elt().find('div.b1:first>table:first');
                table.children('tbody.group-list').children().each(function (data) {
                    var tr = $(this);
                    if (fn.data.getState(tr) == 1) {
                        var item = { state: 1, data: {} }
                        item.data[fn.data.getPKeyName(tr)] = fn.data.getPKey(tr);
                        data.push(item);
                    }
                    var item = fn.data.row(tr);
                    if (!item) return;
                    item.data.define_id = tr.data('define_id');
                    data.push(item);
                }, [data]);
                if (data.length === 0) return false;
                if (is_test) return true;
                win_begin_wait();
                ajaxJson('peijian.php', function (list) {
                    var table = this.elt().find('div.b1:first>table:first');
                    $.each(list, function (table) {
                        var tr = table.children('tbody.group-list').children('tr[data-pkey="' + (this.cid || this.id) + '"]:first');
                        var body = tr.parents('tbody.group-list:first'), group_body = body.prev('tbody');
                        fn.data.onsave(tr, this);
                        if (body.children().size() == 0) {
                            body.remove();
                            group_body.remove();
                        }
                    }, [table]);
                }, {
                    context: this,
                    type: 'POST',
                    data: { act: 'save-xilie', xilie_id: this.xilie_current(), data: JSON.stringify(data) },
                    complete: win_end_wait
                });
            }
        }),
        search_by_xilie: fn.page.expand('按车系搜索配件', 'search_by_xilie', {
            init: function () {
                if (this.base('init')) return true;
                var page_elt = this.elt();
                page_elt.delegate('a[data-fun]:not(.disabled)', 'click', this, function (e) {
                    var tgt = $(e.currentTarget), page = e.data;
                    switch (tgt.attr('data-fun')) {
                        case 'search':
                            page.search();
                            break;
                        case 'guobie-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.guobie.data);
                            break;
                        case 'pinpai-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.pinpai.data[page.guobie_current()]);
                            break;
                        case 'xilie-sel':
                            fn.fenlei.selectDlg(tgt, fn.fenlei.xilie.data[page.pinpai_current()]);
                            break;
                    }
                });
                page_elt.find('.tool.fenlei-sel').delegate('a.btn.sel', '_change', this, function (e, data) {
                    var a = $(e.currentTarget), page = e.data;
                    switch (a.attr('data-fun')) {
                        case 'guobie-sel':
                            na = $(e.delegateTarget).find('a[data-fun="pinpai-sel"]:first');
                            var selected = fn.selectButton.val(a);
                            fn.disable(na, !selected);
                            fn.selectButton.val(na, '');
                            if (selected) {
                                fn.fenlei.pinpai.load(parseInt(selected));
                            }
                            break;
                        case 'pinpai-sel':
                            na = $(e.delegateTarget).find('a[data-fun="xilie-sel"]:first');
                            var selected = fn.selectButton.val(a);
                            fn.disable(na, !selected);
                            fn.selectButton.val(na, '');
                            if (selected) {
                                selected = parseInt(selected);
                                fn.fenlei.xilie.load(parseInt(selected));
                            }
                            break;
                        case 'xilie-sel':
                            var selected = fn.selectButton.val(a);
                            if (selected) {
                                //page.load();
                            }
                            break;
                    }
                });
                page_elt.children('div.type').children('div.tab').delegate('a', 'click', fn.tab.on_active);
                page_elt.find('div.list-nav:first').delegate('a.link:not(.current)', 'click', this, function (e) {
                    e.data.list($(e.currentTarget).data('index'));
                });
                return false;
            },
            guobie_current: fn.fenlei.guobie.current,
            pinpai_current: fn.fenlei.pinpai.current,
            xilie_current: fn.fenlei.xilie.current,
            page_size: fn.search.pageSize,
            listType: function () {
                var typeElt = this.elt().find('div.cls:first>div.item.active:first');
                if (typeElt.size() === 0) return 0;
                return parseInt(typeElt.attr('data-cls-id')) || 0;
            },
            list: function (i) {
                if (i < 0) return;
                var type = this.listType(), list;
                if (type === 0) {
                    list = this.data.list;
                } else {
                    list = this.data.group_dict[type];
                }
                var count = list.length, page_count = Math.ceil(count / this.page_size), showCount = 10;
                if (i >= page_count) return;
                var istart = i - Math.ceil(showCount / 2), iend = istart + showCount - 1;
                if (istart < 0) {
                    iend -= istart;
                    istart = 0;
                }
                if (iend >= page_count) {
                    istart -= iend - page_count + 1;
                    if (istart < 0) istart = 0;
                    iend = page_count - 1;
                }
                var elt = this.elt(), nav_panel = elt.find('div.list-nav:first'), a;
                nav_panel.html('');
                if (istart > 0) {
                    nav_panel.append(fn.htmlRes.get('list-nav-preLinks'));
                }
                for (var j = istart; j <= iend; j++) {
                    nav_panel.append(fn.htmlRes.get('list-nav-link'));
                    nav_panel.children().last().text(j + 1).data('index', j).addClass(j == i ? 'current' : '');

                }
                if (iend < page_count - 1) {
                    nav_panel.append(fn.htmlRes.get('list-nav-nextLinks'));
                }


                var panel = elt.find('div.result:first').html('');

                var start = i * this.page_size, end = Math.min(start + this.page_size, count);
                for (var j = start; j < end; j++) {
                    panel.append(fn.htmlRes.get('search-result-item'));
                    var itemElt = panel.children().last();
                    itemElt.find('a.title:first').text(list[j].define.name);
                    itemElt.find('a.img:first>img:first').error(function () { $(this).css('opacity', '0'); }).attr('src', '/peijian_images/a1.jpg');
                }

            },
            search: function () {
                var xilie_id = this.xilie_current();
                if (!xilie_id || xilie_id <= 0) return false;
                var elt = this.elt();
                elt.find('div.result:first').html('');
                elt.find('div.cls:first').html('');
                win_begin_wait();
                ajaxJson('search.php', function (list) {
                    this.data = fn.search.convertResult(list);
                    var elt = this.elt(), panel = elt.find('div.result:first'), cls_panel = elt.find('div.cls:first');
                    $.each(this.data.group, function (panel) {
                        cls_panel.append(fn.htmlRes.get('search-cls-item'));
                        var div = cls_panel.children().last(), a = div.children('a').first();
                        a.text(this.cls.name);
                    }, [cls_panel]);
                    this.list(0, 20);
                }, {
                    context: this,
                    type: 'GET',
                    data: { act: 'xilie', xilie_id: xilie_id },
                    complete: win_end_wait
                });
            }
        })
    };
    var cfg = {
        first_page_name: 'car_fenlei_m'
    };
    var d = {
        cur_page_name: null
    };
    function go_page(name) {
        if (!name) return;
        if (d.cur_page_name === name) return;
        var cur;
        if (d.cur_page_name && (cur = pageDict[d.cur_page_name])) {
            cur.hide();
        }
        cur = pageDict[name];
        if (!cur) return;
        d.cur_page_name = name;
        cur.show();
    }
    $(document).ready(function () {
        $('*').contents().each(function () {
            if (this.nodeType === 3) {
                var str = $.trim(this.data);
                if (str) {
                } else {
                    $(this).remove();
                }
            }
        });
        $(window).resize(resize);
        resize();
        $('#menu>div>a.l1').click(function (e) {
            var a = $(this);
            var sub = a.next();
            if (a.hasClass('hide')) {
                sub.removeClass('hide');
                a.removeClass('hide');
                var h = sub.height();
                sub.height(0);
                sub.css('overflow', 'hidden');
                sub.animate({ height: h + 'px' }, 200, 'linear', function () {
                    $(this).css('height', '');
                    sub.css('overflow', '');
                });
            } else {
                sub.css('overflow', 'hidden');
                var h = sub.height();
                sub.animate({ height: '0px' }, 200, 'linear', function () {
                    $(this).css('height', '');
                    sub.addClass('hide');
                    a.addClass('hide');
                });
            }
        });
        $('#menu>div>div.l2>a').click(function (e) {
            go_page($(this).attr('data-name'));
        });
        $('html').delegate('input', 'focusin', fn.input.onerror);
        fn.fenlei.guobie.load();
        fn.peijian.dict.load();
    });
})();