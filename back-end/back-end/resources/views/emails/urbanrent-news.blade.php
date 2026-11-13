@component('mail::message')
# {{ $headline }}

Hi {{ $userName }},

{{ $message }}

@if ($propertyTitle)
## Property spotlight

**{{ $propertyTitle }}**

{{ $propertyLocation }}
@endif

## New platform features

@foreach ($features as $feature)
- {{ $feature }}
@endforeach

We are continuously improving UrbanRent to make renting and managing property easier.

@component('mail::button', ['url' => $appUrl])
Open UrbanRent
@endcomponent

Thanks,

The UrbanRent team
@endcomponent
