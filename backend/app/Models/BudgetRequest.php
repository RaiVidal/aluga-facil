<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudgetRequest extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'vehicle',
        'start_date',
        'end_date',
        'message',
        'status',
    ];
}